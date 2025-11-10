import axios from "axios";
import { Book } from "../types";
import { useUserStore } from "../store/useUserStore";

const API_BASE_URL =
  `${process.env.REACT_APP_SERVER_URL}/books` || "http://localhost:5000/books";

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

export async function getBooks(): Promise<Book[]> {
  try {
    const res = await axios.get(API_BASE_URL);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getBookById(id: string): Promise<Book> {
  try {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
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
  imgUrl?: string;
  price?: number;
}): Promise<Book> {
  try {
    const currentUser = useUserStore.getState().user;

    if (!currentUser) throw new Error("Must be logged in to add books");

    const payload = { ...bookData, user_id: currentUser._id };
    const res = await axios.post(API_BASE_URL, payload, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });

    const serverBook = res.data;
    const newBook: Book = {
      _id: serverBook._id || serverBook.id,
      title: serverBook.title,
      author: serverBook.author,
      description: serverBook.description,
      category: serverBook.category,
      img_url: serverBook.img_url,
      price: serverBook.price,
      uploaderId: serverBook.user_id,
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
    handleAxiosError(error);
  }
}

export async function updateBook(
  id: string,
  updates: Partial<Book>
): Promise<Book> {
  try {
    const res = await axios.put(`${API_BASE_URL}/${id}`, updates, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function searchBooks(search: string, page = 1, limit = 10) {
  try {
    const res = await axios.get(`${API_BASE_URL}/search`, {
      params: { s: search, page, limit },
    });
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
    const res = await axios.get(`${API_BASE_URL}/category/${catName}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getBooksByUserId() {
  try {
    const res = await axios.get(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// AI Recommendations
export const getAIRecommendations = async (): Promise<Book[]> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/recommendations`, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
