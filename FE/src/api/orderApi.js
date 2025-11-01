// orderApi.js
import { createUserAxios, createAdminAxios } from "../utils/createInstance";

const userAxios = createUserAxios();
const adminAxios = createAdminAxios();

// User scope
export const getOrdersByUser = async () => {
  const res = await userAxios.get(`/orders`);
  return res.data.data;
};

export const createOrder = async (orderData) => {
  const res = await userAxios.post(`/orders`, orderData);
  return res.data.order;
};

export const cancelOrderByUser = async ({ orderId }) => {
  const res = await userAxios.put(`/orders/cancel`, { orderId });
  return res.data.order;
};

export const addFeedbackToOrder = async (orderId, feedback) => {
  const res = await userAxios.put(`/orders/${orderId}/feedback`, { feedback });
  return res.data.order;
};

// Admin scope
export const getAllOrders = async (search = "") => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  const res = await adminAxios.get(`/orders/all?${queryParams}`);
  return res.data.data;
};

export const getOrderDetail = async (id) => {
  const res = await adminAxios.get(`/orders/${id}`);
  return res.data.data;
};

export const updateOrderStatusByAdmin = async ({ orderId, status }) => {
  const res = await adminAxios.patch(`/orders/status`, { orderId, status });
  return res.data.order;
};

export const softDeleteOrder = async (orderId) => {
  const res = await adminAxios.delete(`/orders/${orderId}`);
  return res.data.order;
};
