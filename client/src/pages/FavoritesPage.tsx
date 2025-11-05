import { useState } from 'react';
import { BookCard } from '../components/BookCard';
import { getFavoriteBooks } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';

export function FavoritesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const books = getFavoriteBooks();

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={6}>
          My Favorites
        </Typography>

        {books.length > 0 ? (
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

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
              <Grid container spacing={3}>
                {filteredBooks.map((book) => (
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
              onClick={() => navigate('/home')}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Browse Books
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
