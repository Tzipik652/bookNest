import axios from "axios";
import { Book } from "../types";
import { useUserStore } from "../store/useUserStore";
import api from "../lib/axiosInstance";


const API_BASE_URL =
  `${import.meta.env.VITE_SERVER_URL}/favorites` || "http://localhost:5000/favorites";

function handleAxiosError(error: any): never {
  if (axios.isAxiosError(error)) {
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Something went wrong with the API request"
    );
  } else {
    throw new Error("Unexpected error: " + error);
  }
}

//Favorites
export async function getFavoriteBooks(): Promise<Book[]> {
 try {
    const res = await api.get(`${API_BASE_URL}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export async function toggleFavorite(bookId: string) {
  try {
    const res = await api.post(
      `${API_BASE_URL}/toggle`,
      { bookId }
    );
    return res.data.message.includes("Added");
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getFavoritesCount(): Promise<number> {
  const user = useUserStore.getState().user;
  const token = useUserStore.getState().token;

  if (!token) throw new Error("Must be logged in to add books");
  if (user?.role !== "admin") throw new Error("Admin access required");
  try {
    const res = await api.get(`${API_BASE_URL}/all/count`);
    return res.data.count;
  } catch (error) {
    handleAxiosError(error);
  }
}