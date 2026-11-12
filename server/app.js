import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// 1. Connect to Database immediately when the app loads (handles Vercel cold starts)
connectDB().catch((err) => {
  console.error("Database connection failed on startup:", err.message);
});

// 2. Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// 3. Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PayCart API is running successfully!",
  });
});

// 4. Product routes
app.use("/api/products", productRoutes);

//Order routes
app.use("/api/orders", orderRoutes);

// 5. Error handling
app.use(notFound);
app.use(errorHandler);

// 6. Local Server Listener (Only runs when running locally, ignored by Vercel)
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`PayCart API running locally on port ${PORT}`);
  });
}

// Export the app for Vercel's serverless handler
export default app;