import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

export const fetchProducts = async () => {
  const res = await axios.get(`${API_BASE_URL}/products`);
  return res.data;
};

export const fetchProductDetail = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/products/${id}`);
  return res.data;
};

export const createProduct = async (product) => {
  const res = await axios.post(`${API_BASE_URL}/products`, product);
  return res.data;
};

export const updateProduct = async (id, product) => {
  const res = await axios.put(`${API_BASE_URL}/products/${id}`, product);
  return res.data;
};
// Alias cũ để code không lỗi
export const updateStatusProduct = updateProduct;

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/products/${id}`);
    return res.data;
};
