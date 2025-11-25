import api from "../lib/axiosInstance";
import axios from "axios";
import { useUserStore } from "../store/useUserStore";
import { Comment } from "../types";

const API_BASE_URL =
  `${process.env.REACT_APP_SERVER_URL}/comments` ||
  "http://localhost:5000/comments";

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

export async function getComments(bookId: string): Promise<Comment[]> {
  const res = await fetch(`${API_BASE_URL}/${bookId}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function addComment(
  bookId: string,
  text: string
): Promise<Comment> {
  const user = useUserStore.getState().user;
  const token = useUserStore.getState().token;

  if (!user || !token) throw new Error("Must be logged in to add comment");

  try {
    const payload = { bookId, text };
    const res = await api.post(API_BASE_URL, payload);

    const serverComment = res.data;
    return {
      id: serverComment.id || serverComment._id,
      book_id: serverComment.book_id,
      user_id: serverComment.user_id,
      user_name: serverComment.user_name,
      profile_picture: serverComment.profile_picture,
      text: serverComment.text,
      created_at: serverComment.created_at || new Date().toISOString(),
      updated_at: serverComment.updated_at || new Date().toISOString(),
      reactions: serverComment.reactions || [],
    };
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function deleteComment(
  commentId: string
): Promise<{ success: boolean }> {
  const user = useUserStore.getState().user;
  const token = useUserStore.getState().token;

  if (!user || !token) throw new Error("Must be logged in to delete comment");

  try {
    const res = await api.delete(`${API_BASE_URL}/${commentId}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function editComment(
  commentId: string,
  text: string
): Promise<{ success: boolean }> {
  const user = useUserStore.getState().user;
  const token = useUserStore.getState().token;

  if (!user || !token) throw new Error("Must be logged in to delete comment");

  try {
    const res = await api.put(
      `${API_BASE_URL}/${commentId}`,
      { text }
    );
    return res.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function getCommentById(commentId: string): Promise<Comment> {
  try {
    const res = await api.get(`${API_BASE_URL}/single/${commentId}`);
    const serverComment = res.data;
    return {
      id: serverComment.id || serverComment._id,
      book_id: serverComment.book_id,
      user_id: serverComment.user_id,
      user_name: serverComment.user_name,
      profile_picture: serverComment.profile_picture,
      text: serverComment.text,
      created_at: serverComment.created_at || new Date().toISOString(),
      updated_at: serverComment.updated_at || new Date().toISOString(),
      reactions: serverComment.reactions || [],
    };
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}
export async function getAllComments(): Promise<Comment[]> {
  const user = useUserStore.getState().user;
  const token = useUserStore.getState().token;

  if (!token) throw new Error("Must be logged in to add books");
  if (user?.role !== "admin") throw new Error("Admin access required");
  try {
    const res = await api.get(`${API_BASE_URL}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
