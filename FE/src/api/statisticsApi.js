import { createAdminAxios } from "../utils/createInstance";

const axiosJWT = createAdminAxios();

export const fetchSummary = async () => {
  const res = await axiosJWT.get(`/statistics/summary`);
  return res.data.summary;
};

export const fetchOrderStatus = async () => {
  const res = await axiosJWT.get(`/statistics/order-status`);
  return res.data.orderStatus;
};
