import { useEffect, useState } from "react";
import { BookCard } from "../components/BookCard";
import {
  Box,
  Button,
  Typography,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { AutoAwesome, Info, Refresh } from "@mui/icons-material";
import { useAIRecommendations } from "../hooks/useAIRecommendations";
import { useFavoriteBooks } from "../hooks/useFavorites";
import { Book, BookWithFavorite } from "../types";
import BookGridSkeleton from "../components/BookGridSkeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function AIRecommendationsPage() {
  const { t } = useTranslation(['AIRecommendations', 'common'])
  const isKeyboardMode = useKeyboardModeBodyClass();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const { countFavoritesForUser } = useFavoriteBooks();
  const favoriteBooksNumber = countFavoritesForUser();

  const { AIRecommendationsQuery } = useAIRecommendations();
  const AIRecommendations = AIRecommendationsQuery.data || [];
  useEffect(() => {
    if (!AIRecommendations) return;

    AIRecommendations.forEach((book) => {
      queryClient.setQueryData<BookWithFavorite>(
        ["book", book._id],
        (existing) => ({
          ...book,
          ...existing,
          isFavorited: existing?.isFavorited ?? false,
          favorites_count:
            existing?.favorites_count ?? book.favorites_count ?? 0,
        })
      );
    });
  }, [AIRecommendations, queryClient]);

  useEffect(() => {
    setIsLoading(AIRecommendationsQuery.isLoading);
  }, [AIRecommendationsQuery.isLoading]);

  useEffect(() => {
    setError(AIRecommendationsQuery.error as string | null);
  }, [AIRecommendationsQuery.error]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await AIRecommendationsQuery.refetch();
    setIsRefreshing(false);
  };
  const getAlertMessage = () => {
    if (favoriteBooksNumber > 0) {
      return t('alertBasedOnFavorites', { count: favoriteBooksNumber });
    }
    return t('alertNoFavorites');
  };
  return (
    <Box minHeight="100vh" py={10} px={3}>
      <Box maxWidth="md" mx="auto" textAlign="center" mb={8}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
          mb={2}
        >
          <AutoAwesome fontSize="large" color="primary" />
          <Typography variant="h4" fontWeight="bold">
            {t('title')}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={3}>
          {t('subtitle')}
        </Typography>

        <Alert
          severity="info"
          icon={false}
          sx={{
            border: "1px solid #d1febfff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <AlertTitle>
            <AutoAwesome fontSize="small" color="primary" sx={{ mr: 1 }} />
          </AlertTitle>
          <Typography variant="body2">
            {getAlertMessage()}
          </Typography>
        </Alert>
       <Button
          variant="contained"
          onClick={handleRefresh}
          sx={{ backgroundColor: "primary.main" ,color:"primary.contrastText"}}
          disabled={isRefreshing}
          startIcon={
            isRefreshing ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <Refresh />
            )
          }
        >
          {isRefreshing ? t('buttonGenerating') : t('buttonGetMore')}
        </Button>
      </Box>

      {/* Recommendations Flexbox */}
      {isLoading ? (
        <BookGridSkeleton count={4} />
      ) : AIRecommendations.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {AIRecommendations.map((book: Book) => (
            <Box
              key={`${book._id}`}
              flex="1 1 calc(25% - 24px)"
              minWidth={250}
              maxWidth={300}
            >
              <BookCard book={book} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={10}>
          <AutoAwesome sx={{ fontSize: 64, color: "#d1d5db", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
           {t('noRecommendationsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('noRecommendationsText')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
