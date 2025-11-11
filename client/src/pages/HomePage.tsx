import { useEffect, useState } from "react";
import { BookCard } from "../components/BookCard";
import { getBooks } from "../services/bookService";
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
} from "@mui/material";
import { Book, Category } from "../types";

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

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

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);


  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={6}>
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
              onChange={(e) => setSelectedCategory(e.target.value)}
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
                <BookCard
                  book={book}
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
      </Container>
    </Box>
  );
}
