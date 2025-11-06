import axios from "axios";
import { Book } from "../types";
import { getCurrentUser } from "../lib/storage"; // או מאיפה שזה נמצא

const API_BASE = "http://localhost:5000/books"; // שנה לפורט הנכון של ה-backend

// עזר להדפסת שגיאות
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

// קבלת כל הספרים
export async function getBooks(): Promise<Book[]> {
  try {
    const res = await axios.get(API_BASE);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// קבלת ספר לפי מזהה
export async function getBookById(id: string): Promise<Book> {
  try {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// הוספת ספר חדש
export async function addBook(bookData: {
  title: string;
  author: string;
  description: string;
  category: string;
  imgUrl?: string;
  price?: number;
}): Promise<Book> {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("Must be logged in to add books");

    const payload = { ...bookData, user_id: currentUser.id };
    const res = await axios.post(API_BASE, payload);

    const serverBook = res.data;

    const newBook: Book = {
      id: serverBook._id || serverBook.id,
      title: serverBook.title,
      author: serverBook.author,
      description: serverBook.description,
      category: serverBook.category,
      img_url: serverBook.img_url,
      price: serverBook.price,
      uploaderId: serverBook.user_id,
      uploaderName: currentUser.name,
      aiSummary: serverBook.ai_summary,
      createdAt: serverBook.date_created || new Date().toISOString(),
    };

    return newBook;
  } catch (error) {
    handleAxiosError(error);
  }
}

// עדכון ספר קיים
export async function updateBook(id: string, updates: Partial<Book>): Promise<Book> {
  try {
    const res = await axios.put(`${API_BASE}/${id}`, updates);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// מחיקת ספר
export async function deleteBook(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE}/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
}

// חיפוש ספרים לפי מחרוזת
export async function searchBooks(search: string, page = 1, limit = 10) {
  try {
    const res = await axios.get(`${API_BASE}/search`, { params: { s: search, page, limit } });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// סינון לפי קטגוריה
export async function getBooksByCategory(catName: string, page = 1, limit = 10) {
  try {
    const res = await axios.get(`${API_BASE}/category/${catName}`, { params: { page, limit } });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// קבלת ספרים לפי משתמש
export async function getBooksByUserId(userId: string) {
  try {
    const res = await axios.get(`${API_BASE}/user/${userId}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
