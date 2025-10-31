import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";

const axiosJWT = createAxios();
export const fetchSummary = async () => {
  const res = await axiosJWT.get(`${API_BASE_URL}/statistics/summary`);
  return res.data.summary;
};

export const fetchOrderStatus = async () => {
  const res = await axiosJWT.get(`${API_BASE_URL}/statistics/order-status`);
  return res.data.orderStatus;
};
