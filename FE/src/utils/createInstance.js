import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "./constant";

const refreshToken = async () => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      {},
      { withCredentials: true }
    );
    return res?.data;
  } catch (error) {
    return null;
  }
};

export const createAxios = () => {
  const newInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });
  newInstance.interceptors.request.use(
    async (config) => {
      const user = JSON.parse(localStorage.getItem("user"));
      let token = localStorage.getItem("accessToken");
      if (!token || !user) {
        return config;
      }

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          const data = await refreshToken();
          if (data?.accessToken) {
            const updatedUser = { ...user, accessToken: data.accessToken };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("accessToken", data.accessToken);
            token = data.accessToken;
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            return config;
          }
        }

        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
      } catch (error) {
        return config;
      }
    },
    (error) => Promise.reject(error)
  );

  return newInstance;
};
