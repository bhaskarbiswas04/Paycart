import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

//Connect to MongoDB
connectDB().catch((err) => {
  console.error("Database connection failed on startup:", err.message);
});

//CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

//Razorpay webhook route MUST come before express.json()
app.use("/api/webhooks", webhookRoutes);

//Parse JSON for regular API routes
app.use(express.json());

//  Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PayCart API is running successfully!",
  });
});

//  Product routes
app.use("/api/products", productRoutes);

//  Order routes
app.use("/api/orders", orderRoutes);

//  Error handling
app.use(notFound);
app.use(errorHandler);

//  Local server listener
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`PayCart API running locally on port ${PORT}`);
  });
}

export default app;