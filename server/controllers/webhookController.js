import crypto from "node:crypto";

import Order from "../models/Order.js";
import WebhookEvent from "../models/WebhookEvent.js";

// --------------------------------------------------
// 1. Verify Razorpay webhook signature
// --------------------------------------------------

const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret || !Buffer.isBuffer(rawBody)) {
    return false;
  }

  if (typeof signature !== "string" || !/^[a-fA-F0-9]{64}$/.test(signature)) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest();

  const receivedSignature = Buffer.from(signature, "hex");

  return (
    expectedSignature.length === receivedSignature.length &&
    crypto.timingSafeEqual(expectedSignature, receivedSignature)
  );
};

// --------------------------------------------------
// 2. Process successful payment events
// --------------------------------------------------

const handlePaymentCaptured = async (payment) => {
  if (
    !payment?.id ||
    !payment?.order_id ||
    !Number.isInteger(payment.amount) ||
    payment.amount <= 0 ||
    payment.status !== "captured" ||
    !payment.currency
  ) {
    throw new Error("Invalid captured payment payload");
  }

  // Find our internal order using Razorpay order ID
  const order = await Order.findOne({
    razorpayOrderId: payment.order_id,
  });

  if (!order) {
    console.error("Webhook: No local order found for:", payment.order_id);

    return "Ignored";
  }

  // Verify amount and currency
  if (
    order.amountPaise !== payment.amount ||
    order.currency !== payment.currency
  ) {
    console.error(
      "Webhook: Payment amount or currency mismatch:",
      payment.order_id,
    );

    return "Ignored";
  }

  // Already paid with this exact payment
  if (order.paymentStatus === "Paid") {
    if (order.razorpayPaymentId === payment.id) {
      return "Processed";
    }

    console.error(
      "Webhook: Order already paid using another payment:",
      order._id,
    );

    return "Ignored";
  }

  // Update only unpaid orders.
  // Failed attempts can transition to Paid if another
  // valid payment attempt for this Razorpay order succeeds.
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: order._id,
      paymentStatus: { $in: ["Pending", "Failed"] },
      razorpayPaymentId: { $in: [null, payment.id] },
    },
    {
      $set: {
        paymentStatus: "Paid",
        razorpayPaymentId: payment.id,
        paidAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (updatedOrder) {
    console.log("Webhook: Order successfully marked Paid:", updatedOrder._id);

    return "Processed";
  }

  // Handle concurrent webhook/API verification requests
  const latestOrder = await Order.findById(order._id);

  if (
    latestOrder?.paymentStatus === "Paid" &&
    latestOrder.razorpayPaymentId === payment.id
  ) {
    return "Processed";
  }

  return "Ignored";
};

// --------------------------------------------------
// 3. Process failed payment events
// --------------------------------------------------

const handlePaymentFailed = async (payment) => {
  if (
    !payment?.id ||
    !payment?.order_id ||
    !Number.isInteger(payment.amount) ||
    payment.amount <= 0 ||
    !payment.currency
  ) {
    throw new Error("Invalid failed payment payload");
  }

  const order = await Order.findOne({
    razorpayOrderId: payment.order_id,
  });

  if (!order) {
    console.error(
      "Webhook: No local order found for failed payment:",
      payment.order_id,
    );

    return "Ignored";
  }

  // Verify amount and currency before updating
  if (
    order.amountPaise !== payment.amount ||
    order.currency !== payment.currency
  ) {
    console.error(
      "Webhook: Failed payment amount or currency mismatch:",
      payment.order_id,
    );

    return "Ignored";
  }

  // Never allow a failed event to overwrite a Paid order.
  // Only Pending orders can transition to Failed.
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: order._id,
      paymentStatus: "Pending",
    },
    {
      $set: {
        paymentStatus: "Failed",
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (updatedOrder) {
    console.log("Webhook: Order payment marked Failed:", updatedOrder._id);

    return "Processed";
  }

  // If the order is already Paid or Failed, leave it unchanged.
  return "Ignored";
};

// --------------------------------------------------
// 4. Main Razorpay webhook controller
// --------------------------------------------------

export const handleRazorpayWebhook = async (req, res) => {
  let webhookEventRecord = null;

  try {
    // A. Read original raw request body
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook request body",
      });
    }

    // B. Get Razorpay signature and event ID
    const signature = req.headers["x-razorpay-signature"];

    const eventId = req.headers["x-razorpay-event-id"];

    if (!eventId || typeof eventId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay event ID",
      });
    }

    // C. Verify signature before parsing JSON
    const signatureValid = verifyWebhookSignature(rawBody, signature);

    if (!signatureValid) {
      console.error("Webhook rejected: Invalid Razorpay signature");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // D. Parse only after signature verification
    let eventPayload;

    try {
      eventPayload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook JSON",
      });
    }

    const eventType = eventPayload.event;

    if (typeof eventType !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook event type",
      });
    }

    // E. Check for duplicate event
    try {
      webhookEventRecord = await WebhookEvent.create({
        eventId,
        eventType,
        status: "Received",
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      const existingEvent = await WebhookEvent.findOne({
        eventId,
      });

      // Previously completed events should not be processed again
      if (
        existingEvent &&
        ["Processed", "Ignored"].includes(existingEvent.status)
      ) {
        return res.status(200).json({
          success: true,
          message: "Duplicate webhook already processed",
        });
      }

      // If a previous attempt failed or was interrupted,
      // retry processing this event.
      webhookEventRecord = existingEvent;

      if (!webhookEventRecord) {
        throw new Error("Unable to retrieve existing webhook event");
      }
    }

    // F. Extract payment entity
    const payment = eventPayload.payload?.payment?.entity;

    let processingResult = "Ignored";

    // G. Process supported events
    switch (eventType) {
      case "payment.captured":
      case "order.paid": {
        processingResult = await handlePaymentCaptured(payment);
        break;
      }

      case "payment.failed": {
        processingResult = await handlePaymentFailed(payment);
        break;
      }

      default: {
        console.log("Webhook event ignored:", eventType);

        processingResult = "Ignored";
      }
    }

    // H. Mark event as processed or ignored
    await WebhookEvent.findOneAndUpdate(
      { eventId },
      {
        $set: {
          status: processingResult,
          processedAt: new Date(),
        },
      },
      { new: true },
    );

    // I. Acknowledge successful processing
    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
      event: eventType,
      processingResult,
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    // Mark failed processing so a retry can be attempted
    if (webhookEventRecord?.eventId) {
      try {
        await WebhookEvent.findOneAndUpdate(
          { eventId: webhookEventRecord.eventId },
          {
            $set: {
              status: "Failed",
            },
          },
        );
      } catch (updateError) {
        console.error(
          "Unable to update webhook event status:",
          updateError.message,
        );
      }
    }

    // Non-2xx response tells Razorpay that processing failed.
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};