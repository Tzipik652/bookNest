import { create } from 'zustand';

interface FavoritesState {
  favorites: Set<string>;
  toggleFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  setFavorites: (ids: string[]) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: new Set(),

  toggleFavorite: (bookId) => {
    const current = new Set(get().favorites);
    if (current.has(bookId)) current.delete(bookId);
    else current.add(bookId);
    set({ favorites: current });
  },

  isFavorite: (bookId) => get().favorites.has(bookId),

  setFavorites: (ids) => set({ favorites: new Set(ids) }),
}));
