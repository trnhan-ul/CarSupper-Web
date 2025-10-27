// orderApi.js
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance"; // Giả sử bạn đã có authApi.js để xử lý token

export const getOrdersByUser = async () => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.get(`${API_BASE_URL}/orders`);
    return res.data.data; // Trả về danh sách đơn hàng của người dùng
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch orders");
  }
};

export const getAllOrders = async (search = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);

    const axiosJWT = createAxios();
    const res = await axiosJWT.get(`${API_BASE_URL}/orders/all?${queryParams}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch all orders"
    );
  }
};

export const createOrder = async (orderData) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.post(`${API_BASE_URL}/orders`, orderData);
    return res.data.order; // Trả về đơn hàng vừa tạo
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error(error.response?.data?.message || "Failed to create order");
  }
};

export const updateOrderStatusByAdmin = async ({ orderId, status }) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/orders/status`, {
      orderId,
      status,
    });
    return res.data.order; // Trả về đơn hàng đã cập nhật
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update order status"
    );
  }
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
