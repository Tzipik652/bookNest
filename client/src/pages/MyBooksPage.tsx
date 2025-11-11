import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "../types/index";
import { getBooksByUserId } from "../services/bookService";
import { BookCard } from "../components/BookCard";
import { Search, BookPlus } from "lucide-react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Container,
  CircularProgress,
} from "@mui/material";

export function MyBooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      setIsLoading(true);
      try {
        const data = await getBooksByUserId();
        setBooks(data || []);
      } catch (error) {
        console.error("Failed to fetch user's books:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooks();
  }, [refreshKey]);

  const filteredBooks = books?.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 6,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            My Books
          </Typography>
          <Button
            variant="contained"
            startIcon={<BookPlus size={18} />}
            onClick={() => navigate("/add-book")}
          >
            Add New Book
          </Button>
        </Box>

        {books?.length > 0 ? (
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

            {isLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                {filteredBooks.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={3}>
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
                  <Box textAlign="center" py={10}>
                    <Typography color="text.secondary">
                      No books found matching your search.
                    </Typography>
                  </Box>
                )}
              </>
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
              onClick={() => navigate("/add-book")}
            >
              Add Your First Book
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
