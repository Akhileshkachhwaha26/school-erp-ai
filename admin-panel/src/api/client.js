import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes("/auth/login");
    const isAuthPage = window.location.pathname === "/login";
    if (err.response?.status === 401 && !isLoginRequest && !isAuthPage) {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err) => {
  if (err.code === "ECONNABORTED") return "Request timed out. Is the backend server running on port 5000?";
  if (!err.response) return "Can't reach the server. Make sure the backend is running (npm run dev in the backend folder).";
  return err.response.data?.message || `Request failed (${err.response.status})`;
};

export default api;
