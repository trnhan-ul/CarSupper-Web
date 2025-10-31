import axios from "axios";
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";

const axiosJWT = createAxios();
export const fetchProducts = async () => {
  const res = await axios.get(`${API_BASE_URL}/products`);
  return res.data;
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
  try {
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
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Lấy chi tiết sản phẩm theo ID
export const fetchProductById = async (productId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/products/${productId}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const createProduct = async (product) => {
  console.log("Received createProduct request with body:", product);
  const res = await axiosJWT.post(`${API_BASE_URL}/products`, product);
  return res.data;
};

export const updateProduct = async (id, product) => {
  const res = await axiosJWT.put(`${API_BASE_URL}/products/${id}`, product);
  return res.data;
// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.post(`${API_BASE_URL}/products`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.product;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(
      `${API_BASE_URL}/products/${id}`,
      productData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data.product;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteProduct = async (id) => {
  const res = await axiosJWT.delete(`${API_BASE_URL}/products/${id}`);
  return res.data;
export const updateStatusProduct = async (id, status) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/products/${id}/status`, {
      status,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
