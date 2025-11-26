import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "../store/useUserStore";
import { getAIRecommendations } from "../services/bookService";
import { Book } from "../types";

export function useAIRecommendations() {
  const user = useUserStore((state) => state.user);

  const AIRecommendationsQuery = useQuery<Book[]>({
    queryKey: ["aiRecommendations", user?._id], 
    queryFn: getAIRecommendations,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: true,
    enabled: !!user,
    retry: 1,
    placeholderData: (previousData) => previousData, 
    gcTime: 1000 * 60 * 30,
  });

  return { AIRecommendationsQuery };
}
