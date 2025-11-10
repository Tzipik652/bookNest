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
import { AutoAwesome, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Book } from "../types";
import { getAIRecommendations } from "../services/bookService";
import { getBookLikes, getFavoriteBooks } from "../services/favoriteService";

export function AIRecommendationsPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
// const favoriteBooks = getFavoriteBooks();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteBooksNumber, setFavoriteBooksNumber] = useState<number>(0);

  useEffect(() => {
    async function fetchRecommendedBooks() {
      setIsLoading(true);
      try {
        const data = await getAIRecommendations();
        setBooks(data || []);
        const favoriteBooksList=await getFavoriteBooks();
        setFavoriteBooksNumber(favoriteBooksList.length);
      } catch (error) {
        setError("Failed to load recommendations. Please try again later.");
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendedBooks();
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
            {favoriteBooksNumber > 0
              ? `Based on your ${favoriteBooksNumber} favorite ${
                  favoriteBooksNumber === 1 ? "book" : "books"
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
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      ) : (
        books.length > 0 ? (
          <Box 
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
            }}
            key={refreshKey}
          >
            {books.map((book) => (
              <Box
                key={`${book._id}-${refreshKey}`}
                 flex="1 1 calc(25% - 24px)"
                    minWidth={250}
                    maxWidth={300}
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
        ))
      }
    </Box>
  );
}
