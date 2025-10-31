import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";

const axiosJWT = createAxios();

export const fetchProducts = async ({
  page = 1,
  limit = 8,
  gender = "",
  category = "",
  minPrice = "",
  maxPrice = "",
  search = "",
  status = "",
} = {}) => {
  const queryParams = new URLSearchParams({ page, limit });
  if (gender) queryParams.append("gender", gender);
  if (category) queryParams.append("category", category);
  if (minPrice) queryParams.append("minPrice", minPrice);
  if (maxPrice) queryParams.append("maxPrice", maxPrice);
  if (search) queryParams.append("name", search);
  if (status) queryParams.append("status", status);

  const res = await axios.get(`${API_BASE_URL}/products?${queryParams}`);
  const { data, pagination } = res.data;
  return { products: data, pagination };
};

export const fetchProductById = async (productId) => {
  const res = await axios.get(`${API_BASE_URL}/products/${productId}`);
  return res.data.data;
};

export const createProduct = async (productData) => {
  const res = await axiosJWT.post(`/products`, productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.product ?? res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await axiosJWT.put(`/products/${id}`, productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.product ?? res.data;
};

export const deleteProduct = async (id) => {
  const res = await axiosJWT.delete(`/products/${id}`);
  return res.data;
};

export const updateStatusProduct = async (id, status) => {
  const res = await axiosJWT.put(`/products/${id}/status`, { status });
  return res.data;
};
