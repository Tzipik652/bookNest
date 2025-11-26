import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavoriteBooks, toggleFavorite } from "../services/favoriteService";
import { Book, BookWithFavorite } from "../types";
import { useUserStore } from "../store/useUserStore";

export function useFavoriteBooks() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  const favoriteBooksQuery = useQuery<Book[]>({
    queryKey: ["favoriteBooks", user?._id],
    queryFn: () => getFavoriteBooks(),
    enabled: !!user?._id,
  });
 
  const toggleMutation = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (bookId: string) => {
      await queryClient.cancelQueries({ queryKey: ["book", bookId] });

      const previousBook = queryClient.getQueryData<BookWithFavorite>([
        "book",
        bookId,
      ]);

      if (previousBook) {
        queryClient.setQueryData<BookWithFavorite>(["book", bookId], {
          ...previousBook,
          isFavorited: !previousBook.isFavorited,
          favorites_count: previousBook.isFavorited
            ? (previousBook.favorites_count ?? 0) - 1
            : (previousBook.favorites_count ?? 0) + 1,
        });
      }
      return { previousBook };
    },

    onError: (err, bookId, context) => {
      if (context?.previousBook) {
        queryClient.setQueryData(["book", bookId], context.previousBook);
      }
    },
    onSettled: (data, error, bookId) => {
      queryClient.invalidateQueries({
        queryKey: ["favoriteBooks", user?._id],
      });
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
    },

    onSuccess: (response, bookId) => {},
  });

  const getBookFromCache = (bookId: string): BookWithFavorite | undefined => {
    return queryClient.getQueryData<BookWithFavorite>(["book", bookId]);
  };

  const isFavorited = (id: string) =>
    !!favoriteBooksQuery.data?.some((b) => b._id === id);

  const getFavoriteCount = (bookId: string): number => {
    const cachedBook = getBookFromCache(bookId);
    return cachedBook?.favorites_count ?? 0;
  };

  const countFavoritesForUser = (): number => {
    return favoriteBooksQuery.data?.length ?? 0;
  };

  return {
    favoriteBooksQuery,
    toggleMutation,
    isFavorited,
    getFavoriteCount,
    countFavoritesForUser,
    getBookFromCache,
  };
}
