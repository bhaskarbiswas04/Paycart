import "dotenv/config";

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const products = [
  {
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    description:
      "Premium wireless headphones with immersive sound and comfortable ear cushions.",
    pricePaise: 149900,
    category: "Electronics",
    images: [],
    stock: 25,
    isActive: true,
  },
  {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-tshirt",
    description: "Comfortable everyday cotton t-shirt with a modern fit.",
    pricePaise: 79900,
    category: "Fashion",
    images: [],
    stock: 40,
    isActive: true,
  },
  {
    name: "Premium Leather Wallet",
    slug: "premium-leather-wallet",
    description:
      "Minimalist wallet with a premium finish and multiple card slots.",
    pricePaise: 59900,
    category: "Accessories",
    images: [],
    stock: 30,
    isActive: true,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    for (const product of products) {
      await Product.updateOne(
        { slug: product.slug },
        { $setOnInsert: product },
        { upsert: true },
      );
    }

    const allProducts = await Product.find();

    console.log("Products seeded successfully!");
    console.log(`Total products in database: ${allProducts.length}`);

    allProducts.forEach((product) => {
      console.log(
        `${product.name} - ₹${(product.pricePaise / 100).toFixed(2)}`,
      );
    });
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();