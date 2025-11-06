import axios from "axios";
import { User, Favorite } from "../types";
import { getCurrentUser } from "../lib/storage"; // או מאיפה שזה נמצא

const API_BASE = "http://localhost:5000"; // בסיס לכל הקריאות, שנה אם צריך

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

// Authentication

export async function login(email: string, password: string): Promise<User> {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    const user: User = res.data;

    // שמירה בלוקל (לא חובה אם כל פעם נבצע קריאה לשרת)
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function register(email: string, password: string, name: string): Promise<User> {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, { email, password, name });
    const user: User = res.data;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    handleAxiosError(error);
  }
}

export function logout() {
  localStorage.removeItem("currentUser");
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

// Favorites (קריאות אהובה)

export async function getFavorites(): Promise<Favorite[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Must be logged in");

  try {
    const res = await axios.get(`${API_BASE}/favorites/user/${currentUser.id}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function addFavorite(callId: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Must be logged in");

  try {
    await axios.post(`${API_BASE}/favorites`, { userId: currentUser.id, callId });
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function removeFavorite(callId: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Must be logged in");

  try {
    await axios.delete(`${API_BASE}/favorites`, { data: { userId: currentUser.id, callId } });
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function toggleFavorite(bookId: string): Promise<boolean> {
  const favorites = await getFavorites();
  const exists = favorites.some(f => f.bookId === bookId);
  if (exists) {
    await removeFavorite(bookId);
    return false;
  } else {
    await addFavorite(bookId);
    return true;
  }
}
