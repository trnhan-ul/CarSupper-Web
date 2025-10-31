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
    const data = res.data.data;

    if (data.isAdmin) {
      localStorage.setItem("adminUser", JSON.stringify(data));
      localStorage.setItem("adminAccessToken", data.accessToken);
    } else {
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userAccessToken", data.accessToken);
    }

    navigate(data.isAdmin ? "/admin" : "/");
    toast.success(res.data.message);
    return data;
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
    localStorage.removeItem("userAccessToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminAccessToken");
    navigate("/");
    toast.success("Logout Successfully");
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};
