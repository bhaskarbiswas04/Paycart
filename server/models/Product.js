import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    pricePaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Price must be an integer in paise",
      },
    },

    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Fashion", "Accessories"],
    },

    images: [
      {
        type: String,
      },
    ],

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
