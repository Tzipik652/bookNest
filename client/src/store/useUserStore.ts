// src/store/useUserStore.ts
import { create } from "zustand";

interface User {
  _id: string;
  email: string;
  name: string;
  auth_provider: string;
  profile_picture?: string;
}

interface UserStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
let initialUser: User | null = null;
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}
export const useUserStore = create<UserStore>((set) => ({
  user: initialUser,
  token: storedToken,

  login: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));
