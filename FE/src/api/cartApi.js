// cartApi.js
import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { toast } from "react-toastify";
import { createAxios } from "../utils/createInstance";

export const fetchCart = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/carts/${userId}`);
  return res.data;
};

export const addToCart = async (cart) => {
  const res = await axios.post(`${API_BASE_URL}/carts`, cart);
  return res.data;
};

export const updateCart = async (userId, cart) => {
  const res = await axios.put(`${API_BASE_URL}/carts/${userId}`, cart);
  return res.data;
};

// Alias cho xóa một sản phẩm khỏi cart
export const deleteCartItem = async (userId, productId) => {
  const res = await axios.delete(`${API_BASE_URL}/carts/${userId}/${productId}`);
  return res.data;
};
export const removeFromCart = deleteCartItem;

// Xóa toàn bộ cart của user (clearCart) nếu backend hỗ trợ
export const clearCart = async (userId) => {
  const res = await axios.delete(`${API_BASE_URL}/carts/${userId}`);
  return res.data;
};

export const updateCartQuantity = async (
  { productId, variantId, quantity },
  userId
) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/carts/${userId}/quantity`, {
      productId,
      variantId,
      quantity,
    });
    return res.data.cart; // Trả về cart đã cập nhật
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to update cart quantity"
    );
    throw error;
  }
};