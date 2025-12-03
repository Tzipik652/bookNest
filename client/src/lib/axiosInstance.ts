// src/lib/axiosInstance.ts
import axios from "axios";
import { useUserStore } from "../store/useUserStore";
import { toast } from "sonner";
import { queryClient } from "./globalQueryClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
});
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const logout = useUserStore.getState().logout;
      logout(queryClient);
      toast.error("Your session has expired. Please log in again.", {
        duration: 6000,
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 6000);
    }
    return Promise.reject(err);
  }
);

export default api;
