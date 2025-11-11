// src/hooks/useAIRecommendations.ts
import { useQuery } from "@tanstack/react-query";
import { getAIRecommendations } from "../services/bookService";
import { Book } from "../types";

export function useAIRecommendations() {
  const AIRecommendationsQuery = useQuery<Book[]>({
    queryKey: ["aiRecommendations"],
    queryFn: getAIRecommendations,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: true,
  });
  return { AIRecommendationsQuery };
}
