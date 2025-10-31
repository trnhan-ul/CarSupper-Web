// cartApi.js
import { toast } from "react-toastify";
import { createAxios } from "../utils/createInstance";

const axiosJWT = createAxios();

// GET /carts → lấy giỏ của user từ token
export const fetchCart = async () => {
  try {
    const res = await axiosJWT.get(`/carts`);
    return res.data.data || res.data; // hỗ trợ cả hai dạng
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// POST /carts  body: { productId }
export const addToCart = async ({ productId }) => {
  try {
    await axiosJWT.post(`/carts`, { productId });
    const updated = await axiosJWT.get(`/carts`);
    return updated.data.data || updated.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to add item to cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Không dùng quantity/variants nữa. Để tương thích, hàm này có thể bỏ hoặc để BE ignore
export const updateCartQuantity = async () => {
  const errorMessage = "Quantity is fixed to 1 per car in this project.";
  toast.info(errorMessage);
  throw new Error(errorMessage);
};

// DELETE /carts/:productId
export const removeFromCart = async (productId) => {
  try {
    const res = await axiosJWT.delete(`/carts/${productId}`);
    const updated = await axiosJWT.get(`/carts`);
    toast.success(res.data?.message || "Item removed from cart!");
    return updated.data.data || updated.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to remove item from cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// DELETE /carts
export const clearCart = async () => {
  try {
    const res = await axiosJWT.delete(`/carts`);
    toast.success("Cart cleared!");
    return res.data.data || res.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to clear cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
