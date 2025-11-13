// src/hooks/useFavoriteBooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavoriteBooks, toggleFavorite } from "../services/favoriteService";
import { Book } from "../types";
import { useUserStore } from "../store/useUserStore";

export function useFavoriteBooks() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  const favoriteBooksQuery = useQuery<Book[]>({
    queryKey: ["favoriteBooks"],
    queryFn: getFavoriteBooks,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (bookId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favoriteBooks"] });

      const prevBooks = queryClient.getQueryData<string[]>(["favorites"]);

      queryClient.setQueryData<Book[]>(
        ["favoriteBooks"],
        (oldBooks: Book[] = []) => {
          const exists = oldBooks.find((b) => b._id === bookId);
          if (exists) return oldBooks.filter((b) => b._id !== bookId);
          return [...oldBooks, { _id: bookId } as Book];
        }
      );

      const prevAIRecommendations = queryClient.getQueryData<Book[]>([
        "aiRecommendations", user?._id
      ]);

      return { prevBooks, prevAIRecommendations };
    },
    onError: (err: any, bookId: string, context: any) => {
      if (context?.prevBooks) {
        queryClient.setQueryData(["favoriteBooks"], context.prevBooks);
      }
      if (context?.prevAIRecommendations) {
        queryClient.setQueryData(
          ["aiRecommendations", user?._id],
          context.prevAIRecommendations
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteBooks"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiRecommendations", user?._id] });
    },
  });

  const isFavorited = (bookId: string) => {
    return favoriteBooksQuery.data?.some((b: Book) => b._id === bookId);
  };

  const countFavorites = () => {
    return favoriteBooksQuery.data?.length || 0;
  };

  return { favoriteBooksQuery, toggleMutation, isFavorited, countFavorites };
}
