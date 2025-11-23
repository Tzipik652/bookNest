import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, useRef } from "react";
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
  Pagination,
} from "@mui/material";
import { Book, Category, BookWithFavorite } from "../types";
import { useUserStore } from "../store/useUserStore";
import LandingComponent from "../components/LandingComponent";
import BookGridSkeleton from "../components/BookGridSkeleton";
import { useFavoriteBooks } from "../hooks/useFavorites";

const BOOKS_PER_PAGE = 20;

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
   
  const discoverRef = useRef<HTMLHeadingElement | null>(null);

  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const { favoriteBooksQuery } = useFavoriteBooks();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: booksData, isLoading: loading } = useQuery({
    queryKey: ["books", selectedCategory, currentPage],
    queryFn: async () => {
      if (selectedCategory === "All") {
        return await getBooks({ page: currentPage, limit: BOOKS_PER_PAGE });
      } else {
        return await getBooksByCategory(selectedCategory, currentPage, BOOKS_PER_PAGE);
      }
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const books = booksData?.books || [];
  const totalPages = booksData?.totalPages || 1;
  const totalItems = booksData?.totalItems || 0;

  useEffect(() => {
    if (!books.length || !favoriteBooksQuery.data) return;

    const favoriteIds = new Set(favoriteBooksQuery.data.map(b => b._id));

    books.forEach((book: Book) => {
      queryClient.setQueryData<BookWithFavorite>(
        ["book", book._id],
        (existing) => ({
          ...existing,
          ...book,
          favorites_count: existing?.favorites_count ?? book.favorites_count ?? 0,
          isFavorited: existing?.isFavorited ?? favoriteIds.has(book._id),
        })
      );
    });
  }, [books, favoriteBooksQuery.data, queryClient]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (value !== currentPage) {
      setCurrentPage(value);
    }
  };

  const filteredBooks = books.filter((book: Book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box sx={{ minHeight: "100vh", paddingBottom: 8 }}>
      {!user && <LandingComponent />}
      
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={2}
          py={2}
          ref={discoverRef}
        >
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

        {/* Books Grid */}
        {loading ? (
          <BookGridSkeleton count={20} />
        ) : filteredBooks.length > 0 ? (
          <Box
            display="flex"
            flexWrap="wrap"
            gap={3}
            justifyContent="flex-start"
          >
            {filteredBooks.map((book: Book) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              size="large"
              disabled={loading}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}