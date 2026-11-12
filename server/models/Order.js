import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    pricePaise: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item",
      },
    },

    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Order amount must be an integer in paise",
      },
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentProvider: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpaySignature: {
      type: String,
      select: false,
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;