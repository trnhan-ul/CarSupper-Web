// userApi.js
import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

export const getAllUsers = async () => {
  const res = await axios.get(`${API_BASE_URL}/users`);
  return res.data;
};

export const getUserDetail = async id => {
  const res = await axios.get(`${API_BASE_URL}/users/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axios.put(`${API_BASE_URL}/users/${id}`, data);
  return res.data;
};

export const deleteUser = async id => {
  const res = await axios.delete(`${API_BASE_URL}/users/${id}`);
  return res.data;
};
