import express from "express";
import {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/:orderId/razorpay", createRazorpayOrder);
router.post("/:orderId/verify-payment", verifyPayment);

export default router;