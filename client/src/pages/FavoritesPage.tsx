import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BookCard } from "../components/BookCard";
import { useNavigate } from "react-router-dom";
import { Heart, Search } from "lucide-react";

import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { Book, BookWithFavorite } from "../types";
import { useFavoriteBooks } from "../hooks/useFavorites";
import BookGridSkeleton from "../components/BookGridSkeleton";

export function FavoritesPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();
  const { favoriteBooksQuery } = useFavoriteBooks();
  const favoriteBooks = favoriteBooksQuery.data || [];
   useEffect(() => {
    if (!favoriteBooks) return;

    favoriteBooks.forEach((book) => {
      queryClient.setQueryData<BookWithFavorite>(
        ["book", book._id],
        (existing) => ({
          ...book,
          ...existing,
          isFavorited: existing?.isFavorited ?? true,
          favorites_count:
            existing?.favorites_count ?? book.favorites_count ?? 1,
        })
      );
    });
  }, [favoriteBooks, queryClient]);

  useEffect(() => {
    setIsLoading(favoriteBooksQuery.isLoading);
  }, [favoriteBooksQuery.isLoading]);
  
  useEffect(() => {
    setError(favoriteBooksQuery.error as string | null);
  }, [favoriteBooksQuery.error]);

  const filteredBooks = favoriteBooks.filter((book: Book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box sx={{ minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={6}>
          My Favorites
        </Typography>

        {favoriteBooks.length > 0 || isLoading ? (
          <>
            {/* Search Field */}
            <Box sx={{ maxWidth: 400, mb: 6 }}>
              <TextField
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {isLoading ? (
              <BookGridSkeleton />
            ) : filteredBooks.length > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                }}
              >
                {filteredBooks.map((book: Book) => (
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
                <Typography color="text.secondary">
                  No books found matching your search.
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Box textAlign="center" py={12}>
            <Heart size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              No Favorites Yet
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Start adding books to your favorites to see them here.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/home")}
              sx={{ textTransform: "none", borderRadius: 3 }}
            >
              Browse Books
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
