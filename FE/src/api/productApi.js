import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";

const axiosJWT = createAxios();
export const fetchProducts = async () => {
  const res = await axios.get(`${API_BASE_URL}/products`);
  return res.data;
};

export const fetchProductDetail = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/products/${id}`);
  return res.data;
};

export const createProduct = async (product) => {
  const res = await axiosJWT.post(`${API_BASE_URL}/products`, product);
  return res.data;
};

export const updateProduct = async (id, product) => {
  const res = await axiosJWT.put(`${API_BASE_URL}/products/${id}`, product);
  return res.data;
};
// Alias cũ để code không lỗi
export const updateStatusProduct = updateProduct;

export const deleteProduct = async (id) => {
  const res = await axiosJWT.delete(`${API_BASE_URL}/products/${id}`);
  return res.data;
};
