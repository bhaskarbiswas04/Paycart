import express from "express";
import { createOrder, createRazorpayOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/:orderId/razorpay", createRazorpayOrder);

export default router;