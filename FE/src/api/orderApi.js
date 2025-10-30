// orderApi.js
import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

export const getAllOrders = async () => {
  const res = await axios.get(`${API_BASE_URL}/orders`);
  return res.data;
};

export const createOrder = async (order) => {
  const res = await axios.post(`${API_BASE_URL}/orders`, order);
  return res.data;
};

export const getOrderDetail = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/orders/${id}`);
  return res.data;
};

export const updateOrderStatusByAdmin = async (id, status) => {
  const res = await axios.put(`${API_BASE_URL}/orders/${id}`, { status });
  return res.data;
};

export const cancelOrderByUser = async ({ orderId }) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/orders/cancel`, {
      orderId,
    });
    return res.data.order; // Trả về đơn hàng đã hủy
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to cancel order");
  }
};

export const addFeedbackToOrder = async (orderId, feedback) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(
      `${API_BASE_URL}/orders/${orderId}/feedback`,
      { feedback }
    );
    return res.data.order; // Trả về đơn hàng đã thêm feedback
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw new Error(error.response?.data?.message || "Failed to add feedback");
  }
};

export const softDeleteOrder = async (orderId) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.delete(`${API_BASE_URL}/orders/${orderId}`);
    return res.data.order; // Trả về đơn hàng đã xóa mềm
  } catch (error) {
    console.error("Error deleting order:", error);
    throw new Error(error.response?.data?.message || "Failed to delete order");
  }
};
