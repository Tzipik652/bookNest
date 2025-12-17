// src/store/useUserStore.ts
import { create } from "zustand";
import { QueryClient } from "@tanstack/react-query";
import { User } from "../types";
import { supabaseFrontendClient } from "../utils/supabaseFrontendClient";


interface UserStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: (queryClient?: QueryClient) => void;
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

  login:async (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  logout: (queryClient?: QueryClient) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
    if (queryClient)
    {
      queryClient.clear();
    }
  },
}));
