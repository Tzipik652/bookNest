import { use, useEffect, useState } from "react";
import { BookCard } from "../components/BookCard";
import {
  getAIRecommendations,
  getFavoriteBooks,
} from "../services/favoriteService";
import {
  Box,
  Button,
  Typography,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { AutoAwesome, Refresh } from "@mui/icons-material";
import { Book } from "../types";

export function AIRecommendationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function fetchData() {
      const rec = await getAIRecommendations();
      const fav = await getFavoriteBooks();
      setRecommendations(rec);
      setFavoriteBooks(fav);
    }
    fetchData();
  }, [refreshKey]);
 
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshKey((k) => k + 1);
    setIsRefreshing(false);
  };

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" py={10} px={3}>
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
            AI Recommendations
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Our AI analyzes your favorite books to suggest titles you might enjoy
        </Typography>

        <Alert
          severity="info"
          sx={{
            background: "linear-gradient(to right, #eff6ff, #f5f3ff)",
            border: "1px solid #bfdbfe",
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
            {favoriteBooks.length > 0
              ? `Based on your ${favoriteBooks.length} favorite ${
                  favoriteBooks.length === 1 ? "book" : "books"
                }, we've found these recommendations for you.`
              : "Add some books to your favorites to get personalized recommendations."}
          </Typography>
        </Alert>

        <Button
          variant="contained"
          color="primary"
          onClick={handleRefresh}
          disabled={isRefreshing}
          startIcon={
            isRefreshing ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <Refresh />
            )
          }
        >
          {isRefreshing ? "Generating..." : "Get More Recommendations"}
        </Button>
      </Box>

      {/* Recommendations Flexbox */}
      {recommendations.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
            maxWidth: "1200px",
            mx: "auto",
          }}
          key={refreshKey}
        >
          {recommendations.map((book) => (
            <Box
              key={`${book._id}-${refreshKey}`}
              sx={{
                flex: "1 1 calc(25% - 24px)", // 4 קלפים בשורה עם רווח
                minWidth: 250,
              }}
            >
              <BookCard
                book={book}
                onFavoriteChange={() => setRefreshKey((k) => k + 1)}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={10}>
          <AutoAwesome sx={{ fontSize: 64, color: "#d1d5db", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Recommendations Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add some books to your favorites to get started
          </Typography>
        </Box>
      )}
    </Box>
  );
}
