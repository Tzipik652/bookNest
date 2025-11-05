import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBooks } from '../lib/storage';
import { BookCard } from '../components/BookCard';
import { Search, BookPlus } from 'lucide-react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Container,
} from '@mui/material';

export function MyBooksPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const books = getUserBooks();

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 6,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            My Books
          </Typography>
          <Button
            variant="contained"
            startIcon={<BookPlus size={18} />}
            onClick={() => navigate('/add-book')}
          >
            Add New Book
          </Button>
        </Box>

        {books.length > 0 ? (
          <>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search your books..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ maxWidth: 400, mb: 5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />

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
          <Box textAlign="center" py={15}>
            <BookPlus size={64} color="#ccc" />
            <Typography variant="h5" mt={2} mb={1}>
              No Books Yet
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Start building your library by adding your first book
            </Typography>
            <Button
              variant="contained"
              startIcon={<BookPlus size={18} />}
              onClick={() => navigate('/add-book')}
            >
              Add Your First Book
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
