import { useCallback, useEffect, useState } from 'react';
import { BookCard } from '../components/BookCard';
import { getBooks, getBooksByCategory } from '../services/bookService';
import { getCategories } from "../services/categoryService";
import { Search } from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Book, Category } from '../types';
const BOOKS_PER_PAGE = 20;

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Handler for changing the page using the Pagination component
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    // Only update the page state if the value is different
    if (value !== currentPage) {
      setCurrentPage(value);
    }
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);
  const fetchBooks = useCallback(async (page: number, limit: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    try {
      let response;
      if (selectedCategory && selectedCategory === 'All') {
        response = await getBooks({ page, limit });
      }
      else {
        response = await getBooksByCategory(selectedCategory, page, limit);
      }
      const {
        books: fetchedBooks,
        totalPages: fetchedTotalPages,
        totalItems: fetchedTotalItems,
      } = response;
      setBooks(fetchedBooks || []);
      setTotalPages(fetchedTotalPages || 1);
      setTotalItems(fetchedTotalItems || 0);
      if (page > fetchedTotalPages && fetchedTotalPages > 0) {
        setCurrentPage(fetchedTotalPages);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }

  }, [selectedCategory]);


  useEffect(() => {
    // Dependencies: currentPage and refreshKey (for manual re-fetch, e.g., favorite change)
    fetchBooks(currentPage, BOOKS_PER_PAGE);
  }, [currentPage, refreshKey, fetchBooks]);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={6}>
          Discover Books
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap' }}>
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
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Books Flexbox */}
        {filteredBooks.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start">
            {filteredBooks.map((book) => (
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
          <Box textAlign="center" py={12}>
            <Typography color="text.secondary">
              No books found matching your criteria.
            </Typography>
          </Box>
        )}
        {/* PAGINATION UI */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              size="large"
              // Disable the pagination control during loading state
              disabled={loading}
            />
          </Box>
        )}
      </Container>
    </Box>

  );
}
