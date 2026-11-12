import express from "express";
import { handleRazorpayWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Preserve the original request body as a Buffer.
// Razorpay webhook signature verification requires this.
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook,
);

export default router;
