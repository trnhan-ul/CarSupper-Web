import axios from "axios";
import { createAxios } from "../utils/createInstance";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../utils/constant";

const axiosJWT = createAxios();

export const loginUser = async (user, navigate) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, user, {
      withCredentials: true,
    });
    localStorage.setItem("user", JSON.stringify(res.data.data));
    localStorage.setItem("accessToken", res.data.data.accessToken);
    navigate(res.data.data.isAdmin ? "/admin" : "/");
    toast.success(res.data.message);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerUser = async (user, navigate) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, user);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const verifyOTPRegister = async (email, otp) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/verify-otp-register`, {
      email,
      otp,
    });
    toast.success("Registration successful! Please log in to continue.");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to verify OTP" };
  }
};

export const getAllUsers = async () => {
  try {
    const res = await axiosJWT.get("/users");
    return res.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to get users" };
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await axiosJWT.delete(`/users/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete user" };
  }
};

export const logout = async (navigate) => {
  try {
    await axiosJWT.post("/auth/logout", {});
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navigate("/");
    toast.success("Logout Successfully");
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};
