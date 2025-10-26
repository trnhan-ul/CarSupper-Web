import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";

export const fetchCategories = async (status = "") => {
  try {
    const query = status ? `?status=${status}` : "";
    const res = await axios.get(`${API_BASE_URL}/categories/all${query}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
};

export const createCategory = async (category) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.post(`${API_BASE_URL}/categories`, category);
    return res.data.data;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create category"
    );
  }
};

export const editCategory = async (id, category) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(
      `${API_BASE_URL}/categories/${id}`,
      category
    );
    return res.data.data;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update category"
    );
  }
};

export const removeCategory = async (id) => {
  try {
    const axiosJWT = createAxios();
    await axiosJWT.delete(`${API_BASE_URL}/categories/${id}`);
    return id;
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete category"
    );
  }
};

export const updateCategoryStatus = async (id, status) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/categories/${id}/status`, {
      status,
    });
    return res.data.data;
  } catch (error) {
    console.error("Failed to update category status:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update category status"
    );
  }
};
