// cartApi.js
import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { toast } from "react-toastify";
import { createAxios } from "../utils/createInstance";

const axiosJWT = createAxios();

export const fetchCart = async (userId) => {
  const res = await axiosJWT.get(`/carts/${userId}`);
  return res.data;
};

export const addToCart = async (cart) => {
  const res = await axiosJWT.post(`/carts`, cart);
  return res.data;
};

export const updateCart = async (userId, cart) => {
  const res = await axiosJWT.put(`/carts/${userId}`, cart);
  return res.data;
};

// Alias cho xóa một sản phẩm khỏi cart
export const deleteCartItem = async (userId, productId) => {
  const res = await axiosJWT.delete(`/carts/${userId}/${productId}`);
  return res.data;
};
export const removeFromCart = deleteCartItem;

// Xóa toàn bộ cart của user (clearCart) nếu backend hỗ trợ
export const clearCart = async (userId) => {
  const res = await axiosJWT.delete(`/carts/${userId}`);
  return res.data;
};

export const updateCartQuantity = async (
  { productId, variantId, quantity },
  userId
) => {
  try {
    const res = await axiosJWT.put(`/carts/${userId}/quantity`, {
      productId,
      variantId,
      quantity,
    });
    return res.data.cart; // Trả về cart đã cập nhật
  } catch (error) {
    throw error;
  }
};