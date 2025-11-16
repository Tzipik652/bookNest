import { useCallback, useEffect, useState } from "react";
import { BookCard } from "../components/BookCard";
import { getBooks, getBooksByCategory } from "../services/bookService";
import { getCategories } from "../services/categoryService";
import { Search } from "lucide-react";
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
} from "@mui/material";
import { Book, Category } from "../types";
import { useUserStore } from "../store/useUserStore";
import LandingComponent from "../components/LandingComponent";
import BookGridSkeleton from "../components/BookGridSkeleton";
const BOOKS_PER_PAGE = 20;

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [loading]);


  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
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
  const fetchBooks = useCallback(
    async (page: number, limit: number) => {
      setLoading(true);
      try {
        let response;
        if (selectedCategory && selectedCategory === "All") {
          response = await getBooks({ page, limit });
        } else {
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
        console.error("Failed to fetch books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    fetchBooks(currentPage, BOOKS_PER_PAGE);
  }, [currentPage, fetchBooks]);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", paddingBottom: 8 }}>
      {!user ? <LandingComponent /> : <></>}
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={2} py={2}>
          Discover Books
        </Typography>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 6, flexWrap: "wrap" }}>
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
        {loading ? (
          <BookGridSkeleton count={20} />
        ) : filteredBooks.length > 0 ? (
          <Box
            display="flex"
            flexWrap="wrap"
            gap={3}
            justifyContent="flex-start"
          >
            {filteredBooks.map((book) => (
              <Box
                key={book._id}
                flex="1 1 calc(25% - 24px)"
                minWidth={250}
                maxWidth={300}
              >
                <BookCard book={book} />
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
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
