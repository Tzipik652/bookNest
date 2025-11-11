// src/hooks/useFavorites.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavoriteBooksIDs, toggleFavorite } from '../services/favoriteService';

export function useFavorites() {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoriteBooksIDs,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (bookId:string) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const prev = queryClient.getQueryData<string[]>(['favorites']);
      queryClient.setQueryData<string[]>(['favorites'], (old:string[] = []) =>
        old.includes(bookId) ? old.filter(id => id !== bookId) : [...old, bookId]
      );
      return { prev };
    },
    onError: (err:any, _:any, context:any) => {
      if (context?.prev) queryClient.setQueryData(['favorites'], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return { favoritesQuery, toggleMutation };
}
