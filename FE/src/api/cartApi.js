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

export const deleteCartItem = async (userId, productId) => {
  const res = await axios.delete(`${API_BASE_URL}/carts/${userId}/${productId}`);
  return res.data;
};

export const updateCartQuantity = async (
  { productId, variantId, quantity },
  userId
) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`