import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";
const axiosJWT = createAxios();

export const getAllOrders = async () => {
  const res = await axiosJWT.get(`/orders`);
  return res.data;
};

export const getOrderDetail = async (id) => {
  const res = await axiosJWT.get(`/orders/${id}`);
  return res.data;
};
export const getOrdersByUser = async (userId) => {
  const res = await axiosJWT.get(`/orders?userId=${userId}`);
  return res.data;
};
export const createOrder = async (order) => {
  const res = await axiosJWT.post(`/orders`, order);
  return res.data;
};
export const updateOrderStatusByAdmin = async (id, status) => {
  const res = await axiosJWT.put(`/orders/${id}`, { status });
  return res.data;
};
export const cancelOrderByUser = async ({ orderId }) => {
  try {
    const res = await axiosJWT.put(`/orders/cancel`, {
      orderId,
    });
    return res.data.order;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to cancel order");
  }
};
export const addFeedbackToOrder = async (orderId, feedback) => {
  try {
    const res = await axiosJWT.put(
      `/orders/${orderId}/feedback`,
      { feedback }
    );
    return res.data.order;
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw new Error(error.response?.data?.message || "Failed to add feedback");
  }
};
export const softDeleteOrder = async (orderId) => {
  try {
    const res = await axiosJWT.delete(`/orders/${orderId}`);
    return res.data.order;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw new Error(error.response?.data?.message || "Failed to delete order");
  }
};
