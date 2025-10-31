// userApi.js
import { API_BASE_URL } from "../utils/constant";
import { createAxios } from "../utils/createInstance";

export const getAllUsers = async (search = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);

    const axiosJWT = createAxios();
    const res = await axiosJWT.get(`${API_BASE_URL}/users?${queryParams}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

export const getUserById = async (userId) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.get(`${API_BASE_URL}/users/${userId}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};

export const updateUser = async (id, updateData) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/users/${id}`, updateData);
    return res.data.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(error.response?.data?.message || "Failed to update user");
  }
};

export const updateStatusUser = async (userId, { status, password }) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/users/${userId}/status`, {
      status,
      password,
    });
    return res.data.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update user status"
    );
  }
};

export const changePassword = async ({ oldPassword, newPassword, userId }) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.put(`${API_BASE_URL}/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
    return res.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error(
      error.response?.data?.message || "Failed to change password"
    );
  }
};

export const deleteUser = async (id) => {
  try {
    const axiosJWT = createAxios();
    const res = await axiosJWT.delete(`${API_BASE_URL}/users/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};
