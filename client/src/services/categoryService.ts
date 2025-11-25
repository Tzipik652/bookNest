import api from "../lib/axiosInstance";

// categoryService.ts
const API_BASE_URL =
  `${process.env.VITE_SERVER_URL}/categories` || "http://localhost:5000/categories";

export async function getCategories() {
  try {
    const res = await api.get(`${API_BASE_URL}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
