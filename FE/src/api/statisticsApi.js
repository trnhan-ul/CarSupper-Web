import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";
import { toast } from "react-toastify";

const axiosJWT = createAxios();

const axiosJWT = createAxios();
export const fetchSummary = async () => {
  const res = await axiosJWT.get(`${API_BASE_URL}/statistics/summary`);
  return res.data.summary;
};

export const fetchOrderStatus = async () => {
  const res = await axiosJWT.get(`${API_BASE_URL}/statistics/order-status`);
  return res.data.orderStatus;
  try {
    const res = await axiosJWT.get(`${API_BASE_URL}/statistics/summary`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (res.data.success) {
      return res.data.summary;
    } else {
      throw new Error("Failed to fetch summary data");
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Failed to fetch summary";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchOrderStatus = async () => {
  try {
    const res = await axiosJWT.get(`${API_BASE_URL}/statistics/order-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (res.data.success) {
      return res.data.orderStatus;
    } else {
      throw new Error("Failed to fetch order status data");
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Failed to fetch order status";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
