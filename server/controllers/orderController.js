import crypto from "node:crypto";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import razorpay from "../services/razorpayService.js";

export const createOrder = async (req, res) => {
  try {
    const { customer, items } = req.body;

    // 1. Validate customer details
    if (!customer || typeof customer !== "object") {
      return res.status(400).json({
        success: false,
        message: "Customer details are required",
      });
    }

    const {
      name,
      email,
      phone,
      address,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
    } = customer;

    const fullAddress = [address || addressLine1, addressLine2]
      .filter((part) => typeof part === "string" && part.trim())
      .map((part) => part.trim())
      .join(", ");

    if (
      !name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "") ||
      !/^[6-9]\d{9}$/.test(phone?.trim() || "") ||
      !fullAddress ||
      !city?.trim() ||
      !state?.trim() ||
      !/^\d{6}$/.test(postalCode?.trim() || "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid customer details",
      });
    }

    // 2. Validate cart items
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty or invalid",
      });
    }

    const productIds = [];
    const quantityMap = new Map();

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity",
        });
      }

      const productId = item.productId;

      if (quantityMap.has(productId)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate products are not allowed in the cart",
        });
      }

      productIds.push(productId);
      quantityMap.set(productId, item.quantity);
    }

    // 3. Fetch actual products from MongoDB
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
    }

    // 4. Validate stock and build order snapshots
    let amountPaise = 0;

    const orderItems = [];

    for (const product of products) {
      const quantity = quantityMap.get(product._id.toString());

      if (!Number.isInteger(product.pricePaise) || product.pricePaise < 0) {
        return res.status(500).json({
          success: false,
          message: "Invalid product price in database",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = product.pricePaise * quantity;

      if (!Number.isSafeInteger(itemTotal)) {
        return res.status(400).json({
          success: false,
          message: "Order amount is too large",
        });
      }

      amountPaise += itemTotal;

      if (!Number.isSafeInteger(amountPaise)) {
        return res.status(400).json({
          success: false,
          message: "Order amount is too large",
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        pricePaise: product.pricePaise,
        quantity,
      });
    }

    if (amountPaise < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // 5. Create Pending order
    const order = await Order.create({
      customer: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: fullAddress,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      },

      items: orderItems,
      amountPaise,
      currency: "INR",
      paymentStatus: "Pending",
      paymentProvider: "Razorpay",
    });

    // 6. Return created order
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order._id,
        amountPaise: order.amountPaise,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        items: order.items,
        customer: order.customer,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
};

// Creat Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find the existing local order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This order is not eligible for payment",
      });
    }

    // Avoid creating another Razorpay order for the same local order
    if (order.razorpayOrderId) {
      return res.status(200).json({
        success: true,
        message: "Payment order already exists",
        payment: {
          keyId: process.env.RAZORPAY_KEY_ID,
          razorpayOrderId: order.razorpayOrderId,
          amount: order.amountPaise,
          currency: order.currency,
          localOrderId: order._id,
        },
      });
    }

    // Create Razorpay order using trusted MongoDB amount
    const razorpayOrder = await razorpay.orders.create({
      amount: order.amountPaise,
      currency: order.currency,
      receipt: order._id.toString(),
      notes: {
        localOrderId: order._id.toString(),
      },
    });

    // Save Razorpay order ID in MongoDB
    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      payment: {
        keyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        localOrderId: order._id,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to initialize payment",
    });
  }
};


// Verify Payment Order
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // 1. Validate request
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^pay_[a-zA-Z0-9]+$/.test(razorpay_payment_id) ||
      !/^order_[a-zA-Z0-9]+$/.test(razorpay_order_id) ||
      !/^[a-fA-F0-9]{64}$/.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification details",
      });
    }

    // 2. Find our MongoDB order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 3. Verify Razorpay order ID against our database
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID mismatch",
      });
    }

    // 4. Handle repeated verification safely
    if (order.paymentStatus === "Paid") {
      if (order.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          paymentStatus: "Paid",
        });
      }

      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    if (order.paymentStatus !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "Order is not eligible for payment verification",
      });
    }

    // 5. Generate HMAC SHA256 signature
    // IMPORTANT: Use the order ID stored in MongoDB.
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest();

    const receivedSignature = Buffer.from(razorpay_signature, "hex");

    // 6. Compare signatures safely
    const signatureValid =
      generatedSignature.length === receivedSignature.length &&
      crypto.timingSafeEqual(generatedSignature, receivedSignature);

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // 7. Fetch actual payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // 8. Verify payment details independently
    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== order.amountPaise ||
      payment.currency !== order.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match the order",
      });
    }

    // Signature verification proves authenticity,
    // but we only mark Paid after Razorpay reports captured.
    if (payment.status !== "captured") {
      return res.status(409).json({
        success: false,
        message: "Payment is not captured yet",
        paymentStatus: payment.status,
      });
    }

    // 9. Atomically update the order.
    // Prevent concurrent verification from overwriting another payment.
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        paymentStatus: "Pending",
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: { $exists: false },
      },
      {
        $set: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: "Paid",
          paidAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedOrder) {
      // Another request may have completed verification.
      const latestOrder = await Order.findById(order._id);

      if (
        latestOrder?.paymentStatus === "Paid" &&
        latestOrder.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          paymentStatus: "Paid",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Order payment state changed. Please check the order.",
      });
    }

    // 10. Return verified result
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentStatus: updatedOrder.paymentStatus,
      orderId: updatedOrder._id,
      paymentId: updatedOrder.razorpayPaymentId,
      amountPaise: updatedOrder.amountPaise,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};