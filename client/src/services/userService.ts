import axios from "axios";
import { User } from "../types";
import { useUserStore } from "../store/useUserStore";
const API_BASE_URL =
  `${process.env.REACT_APP_SERVER_URL}/user` || "http://localhost:5000/user";

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

export const loginLocal = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password,
    });
    const { user, token }: { user: User; token: string } = res.data;

    return { user, token };
  } catch (error: any) {
    handleAxiosError(error);
  }
};

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: User; token: string }> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/register`, {
      email,
      password,
      name,
    });

    const { user, token }: { user: User; token: string } = res.data;

    return { user, token };
  } catch (error) {
    handleAxiosError(error);
  }
};

export const loginWithGoogle = async (
  credentialResponse: any
): Promise<{ user: User; token: string }> => {
  try {
    const id_token = credentialResponse.credential;
    const { data } = await axios.post(`${API_BASE_URL}/google`, {
      id_token,
    });

    if (data.success) {
      localStorage.setItem("token", data.token);
      return { user: data.user, token: data.token };
    } else {
      throw new Error("Google login failed");
    }
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const token = useUserStore.getState().token;

  if (!token) throw new Error("Must be logged in");
  try {
    const res = await axios.get(`${API_BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.users;
  } catch (error) {
    handleAxiosError(error);
  }
};
export const updateUser = async (user: User): Promise<User> => {
  const token = useUserStore.getState().token;
  if (!token) throw new Error("Must be logged in to update user");
  try {
    const res = await axios.put(`${API_BASE_URL}/${user._id}`, user, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
};
export const deleteUser = async (userId: string): Promise<void> => {
  const token = useUserStore.getState().token;
  if (!token) throw new Error("Must be logged in to delete user");
  try {
    await axios.delete(`${API_BASE_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    handleAxiosError(error);
  }
};
