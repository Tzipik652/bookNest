// src/hooks/useAIRecommendations.ts
import { useQuery } from "@tanstack/react-query";
import { getAIRecommendations } from "../services/bookService";
import { Book } from "../types";

export function useAIRecommendations() {
  const AIRecommendationsQuery = useQuery<Book[]>({
    queryKey: ["aiRecommendations"],
    queryFn: getAIRecommendations,
    refetchOnMount: true,
  });
  return { AIRecommendationsQuery };
}
