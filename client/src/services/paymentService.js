import axios from "axios";
import api from "./api";

export const createRazorpayOrder = async (orderId) => {
  try {
    const response = await api.post(`/orders/${orderId}/razorpay`);

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to initialize payment",
        { cause: error },
    );
  }
};


export const verifyPayment = async (orderId, paymentData) => {
  try {
    const response = await api.post(
      `/orders/${orderId}/verify-payment`,
      paymentData,
    );

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Payment verification failed",
      { cause: error },
    );
  }
};

