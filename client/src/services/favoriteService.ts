import axios from "axios";
import { Book, Favorite } from "../types";
import { useUserStore } from "../store/useUserStore";

const API_BASE = "http://localhost:5000/books";

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

export const getFavorites = (): Favorite[] => {
  const favStr = localStorage.getItem('favorites');
  return favStr ? JSON.parse(favStr) : [];
};

export const getFavoriteBooks = (): Book[] => {
  return [];
  // const currentUser = getCurrentUser();
  // if (!currentUser) return [];

  // const favorites = getFavorites();
  // const userFavorites = favorites.filter(f => f.userId === currentUser.id);
  // const books = getBooks();

  // return userFavorites
  //   .map(f => books.find(b => b.id === f.bookId))
  //   .filter((b): b is Book => b !== undefined);
};

export const isFavorite = (bookId: string): boolean => {
  return true
  // const currentUser = getCurrentUser();
  // if (!currentUser) return false;

  // const favorites = getFavorites();
  // return favorites.some(f => f.userId === currentUser.id && f.bookId === bookId);
};

export const addFavorite = (bookId: string): void => {
  // const currentUser = getCurrentUser();
  // if (!currentUser) throw new Error('Must be logged in');

  // const favorites = getFavorites();

  // // Check if already favorited
  // if (favorites.some(f => f.userId === currentUser.id && f.bookId === bookId)) {
  //   return;
  // }

  // favorites.push({ userId: currentUser.id, bookId });
  // localStorage.setItem('favorites', JSON.stringify(favorites));
};

export const removeFavorite = (bookId: string): void => {
  // const currentUser = getCurrentUser();
  // if (!currentUser) return;

  // const favorites = getFavorites();
  // const filtered = favorites.filter(
  //   f => !(f.userId === currentUser.id && f.bookId === bookId)
  // );
  // localStorage.setItem('favorites', JSON.stringify(filtered));
};

export const toggleFavorite = (bookId: string): boolean => {
  if (isFavorite(bookId)) {
    removeFavorite(bookId);
    return false;
  } else {
    addFavorite(bookId);
    return true;
  }
};

// AI Recommendations
export const getAIRecommendations = async (): Promise<Book[]> => {
  try {
    const res = await axios.get(`${API_BASE}/recommendations`, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// Helper function to generate mock AI summaries
function generateMockai_summary(title: string, description: string, category: string): string {
  const summaries = [
    `An engaging ${category.toLowerCase()} work that explores ${description.toLowerCase()}. This book offers unique insights and compelling narratives that will keep readers engaged from start to finish.`,
    `${title} is a remarkable ${category.toLowerCase()} title that delves into ${description.toLowerCase()}. Rich in detail and thoughtfully crafted, this book provides both entertainment and intellectual stimulation.`,
    `A must-read ${category.toLowerCase()} that masterfully examines ${description.toLowerCase()}. The author's expertise shines through every page, making complex ideas accessible and engaging.`
  ];

  return summaries[Math.floor(Math.random() * summaries.length)];
}