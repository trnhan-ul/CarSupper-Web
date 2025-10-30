// userApi.js
import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

export const getAllUsers = async () => {
  const res = await axios.get(`${API_BASE_URL}/users`);
  return res.data;
};

export const getUserDetail = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/users/${id}`);
  return res.data;
};

// Alias cho getUserDetail để code cũ vẫn chạy
export const getUserById = getUserDetail;

export const updateUser = async (id, data) => {
  const res = await axios.put(`${API_BASE_URL}/users/${id}`, data);
  return res.data;
};

// Đổi trạng thái user (PATCH chỉ field status)
export const updateStatusUser = async (id, status) => {
  const res = await axios.patch(`${API_BASE_URL}/users/${id}/status`, { status });
  return res.data;
};

// Đổi mật khẩu user
export const changePassword = async (id, oldPassword, newPassword) => {
  const res = await axios.patch(
    `${API_BASE_URL}/users/${id}/password`,
    { oldPassword, newPassword }
  );
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/users/${id}`);
  return res.data;
};
