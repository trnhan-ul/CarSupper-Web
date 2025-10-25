// cartApi.js
import { API_BASE_URL } from "../utils/constant";
import { toast } from "react-toastify";
import { createAxios } from "../utils/createInstance";

export const fetchCart = async (userId) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.get(`${API_BASE_URL}/carts/${userId}`);
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const addToCart = async (items, userId) => {
  try {
    const axiosJWT = createAxios();
    await axiosJWT.post(`${API_BASE_URL}/carts/${userId}`, {
      items,
    });
    const updatedCart = await axiosJWT.get(`${API_BASE_URL}/carts/${userId}`);
    return updatedCart.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to add item to cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateCartQuantity = async (
  { productId, variantId, quantity },
  userId
) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/carts/${userId}`, {
      productId,
      variantId,
      quantity,
    });
    toast.success("Cart updated!");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const removeFromCart = async ({ productId, variantId }, userId) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.delete(`${API_BASE_URL}/carts/${userId}`, {
      data: { productId, variantId },
    });
    const updatedCart = await axiosJWT.get(`${API_BASE_URL}/carts/${userId}`);
    toast.success(res.data.message || "Item removed from cart!");
    return updatedCart.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to remove item from cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const clearCart = async (userId) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.delete(`${API_BASE_URL}/carts/clear/${userId}`);
    toast.success("Cart cleared!");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to clear cart.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
