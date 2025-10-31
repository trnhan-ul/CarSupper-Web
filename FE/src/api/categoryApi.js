import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";

const axiosJWT = createAxios();
export const fetchCategories = async () => {
  const res = await axiosJWT.get(`${API_BASE_URL}/categories`);
  return res.data;
};

export const fetchCategoryDetail = async (id) => {
  const res = await axiosJWT.get(`${API_BASE_URL}/categories/${id}`);
  return res.data;
};

export const createCategory = async (category) => {
  const res = await axiosJWT.post(`${API_BASE_URL}/categories`, category);
  return res.data;
};

// Alias để code cũ dùng editCategory vẫn chạy
export const updateCategory = async (id, category) => {
  const res = await axiosJWT.put(`${API_BASE_URL}/categories/${id}`, category);
  return res.data;
};

// API đổi status category (chuẩn RESTful là PATCH)/alias cho code cũ
export const updateCategoryStatus = async (id, status) => {
  const res = await axiosJWT.patch(`${API_BASE_URL}/categories/${id}/status`, { status });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axiosJWT.delete(`${API_BASE_URL}/categories/${id}`);
  return res.data;
};
