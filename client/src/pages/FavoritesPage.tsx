import { use, useEffect, useState } from "react";
import { BookCard } from "../components/BookCard";
import { getFavoriteBooks } from "../services/favoriteService";
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
import { Book } from "../types";
import { useFavoriteBooks } from "../hooks/useFavorites";

export function FavoritesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { favoriteBooksQuery } = useFavoriteBooks();
  const favoriteBooks = favoriteBooksQuery.data || [];


  const filteredBooks = favoriteBooks.filter((favoriteBooks) => {
    const matchesSearch =
      favoriteBooks.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favoriteBooks.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={6}>
          My Favorites
        </Typography>

        {favoriteBooks.length > 0 ? (
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

            {/* Books Flexbox */}
            {filteredBooks.length > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  justifyContent: "flex-start",
                }}
              >
                {filteredBooks.map((book: Book) => (
                  <Box
                    key={book._id}
                    sx={{
                      flex: "1 1 calc(25% - 24px)",
                      minWidth: 250,
                    }}
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
