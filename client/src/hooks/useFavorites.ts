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
      await queryClient.cancelQueries({
        queryKey: ["favoriteBooks", user?._id],
      });

      const previousFavoriteBooks = queryClient.getQueryData<Book[]>([
        "favoriteBooks",
        user?._id,
      ]);
      const previousBook = queryClient.getQueryData<BookWithFavorite>([
        "book",
        bookId,
      ]);

      queryClient.setQueryData<Book[]>(
        ["favoriteBooks", user?._id],
        (old = []) => {
          if (!previousBook) return old;
          const exists = old.find((b) => b._id === bookId);
          return exists
            ? old.filter((b) => b._id !== bookId)
            : [...old, previousBook];
        }
      );

      // update single book cache optimistically
      queryClient.setQueryData<BookWithFavorite>(["book", bookId], (old) => {
        if (!old) return old;
        queryClient.setQueryData<BookWithFavorite>(["book", bookId], (old) => {
          if (!old) return old;
          return {
            ...old,
            favorites_count:
              (old.favorites_count ?? 0) + (old.isFavorited ? -1 : 1),
            isFavorited: !old.isFavorited,
          };
        });
      });

      return { previousFavoriteBooks, previousBook };
    },
    onError: (err, bookId, context) => {
      if (context?.previousFavoriteBooks) {
        queryClient.setQueryData(
          ["favoriteBooks", user?._id],
          context.previousFavoriteBooks
        );
      }
      if (context?.previousBook) {
        queryClient.setQueryData(["book", bookId], context.previousBook);
      }
    },
    onSettled: (data, error, bookId) => {
      queryClient.invalidateQueries({ queryKey: ["favoriteBooks", user?._id] });
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
    },
  });

  const isFavorited = (bookId: string) =>
    favoriteBooksQuery.data?.some((b) => b?._id === bookId) ?? false;

  const countFavoritesForUser = () => {
    return favoriteBooksQuery.data?.length || 0;
  };
  return {
    favoriteBooksQuery,
    toggleMutation,
    isFavorited,
    countFavoritesForUser,
  };
}
