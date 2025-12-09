import { UserCopy } from "../types";
import api from "../lib/axiosInstance";
import axios from "axios";
import { useUserStore } from "../store/useUserStore";
const API_BASE_URL =
  `${import.meta.env.VITE_SERVER_URL}/user-copies` ||
  "http://localhost:5000/user-copies";

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

export const addUserCopy = async (user_copy: UserCopy) => {
  try {    
    const response = await api.post(API_BASE_URL, {
      user_copy,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getCopies = async () => {
  try {
    const response = await api.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getCopyById = async (id: string) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getUserCopies = async (userId: string) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${userId}/user-copies`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getBookCopies = async (bookId: string) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${bookId}/book-copies`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getUserCopy = async (bookId: string) => {
  try {
    const { user: currentUser } = useUserStore.getState();
    if (!currentUser) {
      throw new Error("User not found");
    }
    const response = await api.get(`${API_BASE_URL}/book-copy/${currentUser._id}/${bookId}`);
    return response.data.data;
  } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    handleAxiosError(error);
  }
};

export const changeStatus = async (copyId: string) => {
  try {
    if (!copyId) {
      throw new Error("Copy not found");
    }
    const response = await api.put(`${API_BASE_URL}/${copyId}/status`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const changeLoanLocation = async (
  loan_location_lat: number,
  loan_location_lon: number,
  copyId: string
) => {
  try {
    const response = await api.put(`${API_BASE_URL}/${copyId}/location`, {
      loan_location_lat,
      loan_location_lon,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteCopy = async (copyId: string) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/${copyId}`);
    return response.status === 200;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getAvailableCopiesForBook = async (bookId: string) => {
  try {
    console.log("get available copies for book",bookId)
    if (!bookId) {
      throw new Error("Book not found");
    }
    const res = await api.get(`${API_BASE_URL}/${bookId}/available-book-copies`);
    console.log("available copies for book",res.data)
    return res.data.data;
  } catch (error) {
    handleAxiosError(error);
  }
};


export const disableLending = async (userCopyId: string) => {
  try {
    const copyUpdated = await changeStatus(userCopyId);
    return copyUpdated.data;
  } catch (error) {
    handleAxiosError(error);
  }
};
