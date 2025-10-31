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

const createAxiosFor = ({ tokenKey, userKey }) => {
  const instance = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

  instance.interceptors.request.use(
    async (config) => {
      const storedUser = localStorage.getItem(userKey);
      let token = localStorage.getItem(tokenKey);
      if (!token || !storedUser) return config;

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          const data = await refreshToken();
          if (data?.accessToken) {
            const updatedUser = { ...JSON.parse(storedUser), accessToken: data.accessToken };
            localStorage.setItem(userKey, JSON.stringify(updatedUser));
            localStorage.setItem(tokenKey, data.accessToken);
            token = data.accessToken;
          } else {
            localStorage.removeItem(userKey);
            localStorage.removeItem(tokenKey);
            return config;
          }
        }
        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
      } catch (e) {
        return config;
      }
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

export const createUserAxios = () => createAxiosFor({ tokenKey: "userAccessToken", userKey: "user" });
export const createAdminAxios = () => createAxiosFor({ tokenKey: "adminAccessToken", userKey: "adminUser" });

// Backward compatibility - use whichever is present (prefers user token)
export const createAxios = () => {
  const userToken = localStorage.getItem("userAccessToken");
  const adminToken = localStorage.getItem("adminAccessToken");
  return userToken || !adminToken ? createUserAxios() : createAdminAxios();
};
