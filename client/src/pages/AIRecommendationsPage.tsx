import { useState } from "react";
import { BookCard } from "../components/BookCard";
import { getAIRecommendations, getFavoriteBooks } from "../lib/storage";
import {
  Box,
  Button,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { Sparkles, RefreshCw } from "lucide-react";

export function AIRecommendationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const recommendations = getAIRecommendations();
  const favoriteBooks = getFavoriteBooks();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshKey((k) => k + 1);
    setIsRefreshing(false);
  };

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" py={10} px={3}>
      <Box maxWidth="md" mx="auto" textAlign="center" mb={8}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
          <Sparkles size={32} color="#1e40af" />
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
            <Sparkles size={18} color="#2563eb" style={{ marginRight: 6 }} />
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
              <RefreshCw size={18} />
            )
          }
        >
          {isRefreshing ? "Generating..." : "Get More Recommendations"}
        </Button>
      </Box>

      {/* Recommendations Grid */}
      {recommendations.length > 0 ? (
        <Grid
          container
          spacing={3}
          justifyContent="center"
          key={refreshKey}
          maxWidth="lg"
          mx="auto"
        >
          {recommendations.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`${book.id}-${refreshKey}`}>
              <BookCard
                book={book}
                onFavoriteChange={() => setRefreshKey((k) => k + 1)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={10}>
          <Sparkles size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
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
