import { useState } from 'react';
import { BookCard } from '../components/BookCard';
import { getBooks } from '../lib/storage';
import { categories } from '../lib/mockData';
import { Search } from 'lucide-react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  const books = getBooks();

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={6}>
          Discover Books
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 6,
            flexWrap: 'wrap',
          }}
        >
          <TextField
            placeholder="Search books or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 250, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <Box textAlign="center" py={12}>
            <Typography color="text.secondary">No books found matching your criteria.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
