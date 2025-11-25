import api from "../lib/axiosInstance";

const API_BASE_URL =
  `${process.env.REACT_APP_SERVER_URL}/api/auth` || "http://localhost:5000/api/auth";

export const forgotPassword = async (email: string) => {
    await api.post(`${API_BASE_URL}/forgot-password`, { email });
};

export const resetPassword = async (token: string, password: string) => {
  await api.post(`${API_BASE_URL}/reset-password/${token}`, { password });
};
