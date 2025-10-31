import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAdminAxios } from "../utils/createInstance";

const adminAxios = createAdminAxios();

// Public endpoints
export const fetchCategories = async () => {
  const res = await axios.get(`${API_BASE_URL}/categories`);
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
};

export const fetchCategoryDetail = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/categories/${id}`);
  return res.data?.data ?? res.data;
};

// Admin endpoints
export const createCategory = async (category) => {
  const res = await adminAxios.post(`/categories`, category);
  return res.data;
};

export const updateCategory = async (id, category) => {
  const res = await adminAxios.put(`/categories/${id}`, category);
  return res.data;
};

// Backward compatibility with old import name
export const editCategory = updateCategory;

export const updateCategoryStatus = async (id, status) => {
  const res = await adminAxios.patch(`/categories/${id}/status`, { status });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await adminAxios.delete(`/categories/${id}`);
  return res.data;
};
