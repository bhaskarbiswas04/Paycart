
import axios from "axios";
import api from "./api";

export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to create your order",
      { cause: error },
    );
  }
};