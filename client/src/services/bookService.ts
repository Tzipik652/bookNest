import { Book } from "../types";
import { useUserStore } from "../store/useUserStore";
import api from "../lib/axiosInstance";
import axios from "axios";
const API_BASE_URL =
  `${import.meta.env.VITE_SERVER_URL}/books` || "http://localhost:5000/books";

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

/**
 * Fetches books with optional pagination parameters.
 * @param {object} params - The request parameters.
 * @param {number} [params.page=1] - The current page number.
 * @param {number} [params.limit=20] - The limit of items per page.
 * @returns {Promise<{books: Object[], currentPage: number, limit: number, totalItems: number, totalPages: number}>}
 */
export async function getBooks(params = { page: 1, limit: 20 }) {
    try {
        const query = new URLSearchParams({ 
            page: (params.page || 1).toString(), 
            limit: (params.limit || 20).toString() 
        });

        const response = await api.get(`${API_BASE_URL}?${query.toString()}`);
        // The backend should return the structured data (books, currentPage, totalPages, etc.)
        return response.data; 

    } catch (error) {
        console.error('Error fetching books from API:', error);
        throw error;
    }
}
export async function getBookById(id: string): Promise<Book> {
  try {
    const res = await api.get(`${API_BASE_URL}/${id}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function addBook(bookData: {
  title: string;
  author: string;
  description: string;
  category: string;
  img_url?: string;
  price?: number;
}): Promise<Book> {
  try {
    const currentUser = useUserStore.getState().user;

    if (!currentUser) throw new Error("Must be logged in to add books");

    const payload = { ...bookData, user_id: currentUser._id };
    const res = await api.post(API_BASE_URL, payload);
    const serverBook = res.data;
    const newBook: Book = {
      _id: serverBook._id || serverBook.id,
      title: serverBook.title,
      author: serverBook.author,
      description: serverBook.description,
      category: serverBook.category,
      img_url: serverBook.img_url,
      price: serverBook.price,
      user: {
        name: currentUser.name,
        email: currentUser.email,
      },
      user_id: currentUser.name,
      ai_summary: serverBook.ai_summary,
      date_created: serverBook.date_created || new Date().toISOString(),
    };
    return newBook;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new Error("Book already exists.");
    }
    handleAxiosError(error);
  }
}

export async function updateBook(
  id: string,
  updates: Partial<Book>
): Promise<Book> {
  try {
    const res = await api.put(`${API_BASE_URL}/${id}`, updates);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    await api.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function searchBooks(search: string, page = 1, limit = 10, category?:string) {
  try {
    const res = await api.get(`${API_BASE_URL}/search`, {
      params: { s: search, page, limit, category },
    });
    console.log("search", search)
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getBooksByCategory(
  catName: string,
  page = 1,
  limit = 10
) {
  try {
    const res = await api.get(`${API_BASE_URL}/category/${catName}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getBooksByUserId() {
  try {
    const res = await api.get(`${API_BASE_URL}/user`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}


// AI Recommendations
export const getAIRecommendations = async (): Promise<Book[]> => {
  try {
    const res = await api.get(`${API_BASE_URL}/recommendations`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
