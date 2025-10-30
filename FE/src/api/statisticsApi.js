import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

export const fetchSummary = async () => {
  const res = await axios.get(`${API_BASE_URL}/statistics/summary`);
  return res.data;
};

export const fetchOrderStatus = async () => {
  const res = await axios.get(`${API_BASE_URL}/statistics/order-status`);
  return res.data;
};
