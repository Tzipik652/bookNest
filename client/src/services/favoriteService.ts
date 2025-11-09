import axios from "axios";
import { Book, Favorite } from "../types";

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
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const favorites = getFavorites();
  const userFavorites = favorites.filter(f => f.userId === currentUser.id);
  const books = getBooks();
  
  return userFavorites
    .map(f => books.find(b => b.id === f.bookId))
    .filter((b): b is Book => b !== undefined);
};

export const isFavorite = (bookId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const favorites = getFavorites();
  return favorites.some(f => f.userId === currentUser.id && f.bookId === bookId);
};

export const addFavorite = (bookId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const favorites = getFavorites();
  
  // Check if already favorited
  if (favorites.some(f => f.userId === currentUser.id && f.bookId === bookId)) {
    return;
  }
  
  favorites.push({ userId: currentUser.id, bookId });
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

export const removeFavorite = (bookId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const favorites = getFavorites();
  const filtered = favorites.filter(
    f => !(f.userId === currentUser.id && f.bookId === bookId)
  );
  localStorage.setItem('favorites', JSON.stringify(filtered));
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
export const getAIRecommendations = (): Book[] => {
  const favoriteBooks = getFavoriteBooks();
  const allBooks = getBooks();
  
  if (favoriteBooks.length === 0) {
    // If no favorites, return random selection
    return allBooks.slice(0, 5);
  }
  
  // Get categories from favorite books
  const favoriteCategories = favoriteBooks.map(b => b.category);
  
  // Find books with similar categories that aren't already favorited
  const favoriteIds = new Set(favoriteBooks.map(b => b.id));
  const recommendations = allBooks
    .filter(b => !favoriteIds.has(b.id))
    .filter(b => favoriteCategories.includes(b.category))
    .slice(0, 5);
  
  // If not enough recommendations, add some random ones
  if (recommendations.length < 5) {
    const remainingBooks = allBooks
      .filter(b => !favoriteIds.has(b.id))
      .filter(b => !recommendations.some(r => r.id === b.id))
      .slice(0, 5 - recommendations.length);
    
    recommendations.push(...remainingBooks);
  }
  
  return recommendations;
};

// Helper function to generate mock AI summaries
function generateMockAISummary(title: string, description: string, category: string): string {
  const summaries = [
    `An engaging ${category.toLowerCase()} work that explores ${description.toLowerCase()}. This book offers unique insights and compelling narratives that will keep readers engaged from start to finish.`,
    `${title} is a remarkable ${category.toLowerCase()} title that delves into ${description.toLowerCase()}. Rich in detail and thoughtfully crafted, this book provides both entertainment and intellectual stimulation.`,
    `A must-read ${category.toLowerCase()} that masterfully examines ${description.toLowerCase()}. The author's expertise shines through every page, making complex ideas accessible and engaging.`
  ];
  
  return summaries[Math.floor(Math.random() * summaries.length)];
}