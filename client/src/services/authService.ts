import axios from "axios";

const API_BASE_URL =
  `${import.meta.env.VITE_SERVER_URL}/api/auth` || "http://localhost:5000/api/auth";

export const forgotPassword = async (email: string) => {
    await axios.post(`${API_BASE_URL}/forgot-password`, { email });
};

export const resetPassword = async (token: string, password: string) => {
  await axios.post(`${API_BASE_URL}/reset-password/${token}`, { password });
};
