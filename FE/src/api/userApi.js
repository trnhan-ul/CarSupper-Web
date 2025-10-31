// userApi.js
import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";
const axiosJWT = createAxios();

export const getAllUsers = async () => {
  const res = await axiosJWT.get(`${API_BASE_URL}/users`);
  return res.data.data;
};

export const getUserDetail = async (id) => {
  const res = await axiosJWT.get(`${API_BASE_URL}/users/${id}`);
  return res.data;
};

// Alias cho getUserDetail để code cũ vẫn chạy
export const getUserById = getUserDetail;

export const updateUser = async (id, data) => {
  const res = await axiosJWT.put(`/users/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

// Đổi trạng thái user (PATCH chỉ field status)
export const updateStatusUser = async (id, status) => {
  const res = await axiosJWT.patch(`${API_BASE_URL}/users/${id}/status`, { status });
  return res.data;
};

// Đổi mật khẩu user
export const changePassword = async (id, oldPassword, newPassword) => {
  const res = await axiosJWT.patch(
    `${API_BASE_URL}/users/${id}/password`,
    { oldPassword, newPassword }
  );
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosJWT.delete(`${API_BASE_URL}/users/${id}`);
  return res.data;
};
