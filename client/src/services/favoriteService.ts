import axios from "axios";
import { Book, Favorite } from "../types";
import { useUserStore } from "../store/useUserStore";


const API_BASE_URL =
  `${process.env.REACT_APP_SERVER_URL}/favorites` || "http://localhost:5000/favorites";

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
    const res = await axios.get(`${API_BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });
    console.log("Favorite Books:", res.data);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export async function isFavorite(bookId: string): Promise<boolean> {
 try {
    const res = await axios.get(`${API_BASE_URL}/${bookId}`, {
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });
    return res.data.favorite;
  } catch (error) {
    handleAxiosError(error);
  }
};


export async function toggleFavorite(bookId: string) {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/toggle`,
      { bookId }, 
      {
        headers: {
          Authorization: `Bearer ${useUserStore.getState().token}`,
        },
      }
    );
    return res.data.message.includes("Added");
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getBookLikes(bookId: string): Promise<number> {
 try {
    const res = await axios.get(`${API_BASE_URL}/count/${bookId}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Helper function to generate mock AI summaries
function generateMockai_summary(
  title: string,
  description: string,
  category: string
): string {
  const summaries = [
    `An engaging ${category.toLowerCase()} work that explores ${description.toLowerCase()}. This book offers unique insights and compelling narratives that will keep readers engaged from start to finish.`,
    `${title} is a remarkable ${category.toLowerCase()} title that delves into ${description.toLowerCase()}. Rich in detail and thoughtfully crafted, this book provides both entertainment and intellectual stimulation.`,
    `A must-read ${category.toLowerCase()} that masterfully examines ${description.toLowerCase()}. The author's expertise shines through every page, making complex ideas accessible and engaging.`,
  ];

  return summaries[Math.floor(Math.random() * summaries.length)];
}
