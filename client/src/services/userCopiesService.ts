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
function transformUserCopy(raw: any): UserCopy {
  return {
    id: raw.id,
    book_id: raw.book_id._id,
    book_title: raw.book_id.title,
    owner_id: raw.owner_id._id,
    owner_name: raw.owner_id.name,
    owner_email: raw.owner_id.email,
    is_available_for_loan: raw.is_available_for_loan,
    loan_location_lat: raw.loan_location_lat,
    loan_location_lon: raw.loan_location_lon,
    date_added: raw.date_added,
  };
}
export const addUserCopy = async (user_copy: UserCopy) => {
  try {
    const response = await api.post(API_BASE_URL, {
      user_copy,
    });
    return transformUserCopy(response.data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getCopies = async () => {
  try {
    const response = await api.get(API_BASE_URL);
    return response.data.map(transformUserCopy);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getCopyById = async (id: string) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return transformUserCopy(response.data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getUserCopies = async (userId: string) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${userId}/user-copies`);
    return response.data.map(transformUserCopy);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getBookCopies = async (bookId: string) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${bookId}/book-copies`);
    return response.data.map(transformUserCopy);
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
    const response = await api.get(
      `${API_BASE_URL}/book-copy/${currentUser._id}/${bookId}`
    );
    if(!response.data.data){
      return
    }
    return transformUserCopy(response.data.data);
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
    return transformUserCopy(response.data.data);
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
    return transformUserCopy(response.data);
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
    if (!bookId) {
      throw new Error("Book not found");
    }
    const res = await api.get(
      `${API_BASE_URL}/${bookId}/available-book-copies`
    );
    console.log(res.data.data.map(transformUserCopy))
    return res.data.data.map(transformUserCopy);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const disableLending = async (userCopyId: string) => {
  try {
    const copyUpdated = await changeStatus(userCopyId);
    return copyUpdated;
  } catch (error) {
    handleAxiosError(error);
  }
};
