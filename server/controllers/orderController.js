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