import "dotenv/config";

import express from "express";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PayCart API is running successfully!",
  });
});

// Product routes
app.use("/api/products", productRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;