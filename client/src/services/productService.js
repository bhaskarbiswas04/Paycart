import api from "./api";
import axios from "axios";

export const getProducts = async (params = {}, config = {}) => {
  try {
    const response = await api.get("/products", {
      ...config,
      params,
    });

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to fetch products",
        { cause: error}
    );
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to fetch product",
      { cause: error }, // <-- Pass the original error here
    );
  }
};

