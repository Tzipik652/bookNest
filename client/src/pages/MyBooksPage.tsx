import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, BookWithFavorite } from "../types/index";
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
  Grid,
} from "@mui/material";
import BookGridSkeleton from "../components/BookGridSkeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useFavoriteBooks } from "../hooks/useFavorites";
import { useTranslation } from "react-i18next";
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function MyBooksPage() {
  const { t } = useTranslation("myBooksPage");
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();
  const { isFavorited } = useFavoriteBooks();

  useEffect(() => {
    async function fetchBooks() {
      setIsLoading(true);
      try {
        const data = await getBooksByUserId();
        setBooks(Array.isArray(data) ? data : []);

        data?.forEach((book: Book) => {
          queryClient.setQueryData<BookWithFavorite>(
            ["book", book._id],
            (existing) => ({
              ...existing,
              ...book,
              favorites_count:
                existing?.favorites_count ?? book.favorites_count ?? 0,
              isFavorited:
                existing?.isFavorited ?? isFavorited(book._id) ?? false,
            })
          );
        });
      } catch (error) {
        console.error("Failed to fetch user's books:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooks();
  }, []);

  const filteredBooks = books?.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const AddBookButton = () => (
    <Button
      variant="contained"
      startIcon={<BookPlus size={18} />}
      onClick={() => navigate("/add-book")}
      aria-label={t("addButton")}
    >
      {t("addButton")}
    </Button>
  );

  const renderContent = () => {
    if (isLoading) {
      return <BookGridSkeleton count={8} />;
    }

    if (books.length === 0) {
      return (
        <Box textAlign="center" py={15}>
          <BookPlus size={64} color="#ccc" />
          <Typography variant="h5" mt={2} mb={1}>
            {t("emptyState.title")}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {t("emptyState.subtitle")}
          </Typography>
          <AddBookButton />
        </Box>
      );
    }

    return (
      <>
        <TextField
          fullWidth
          placeholder={t("searchPlaceholder")}
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

        {filteredBooks.length > 0 ? (
          <Grid container spacing={3}>
            {filteredBooks.map((book) => (
              <Box
                key={`${book._id}`}
                flex="1 1 calc(25% - 24px)"
                minWidth={250}
                maxWidth={300}
              >
                <BookCard book={book} />
              </Box>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" py={10}>
            <Typography color="text.secondary">
              {t("emptySearchMessage")}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 6,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {t("pageTitle")}
          </Typography>
          {books.length > 0 && <AddBookButton />}
        </Box>

        {renderContent()}
      </Container>
    </Box>
  );
}
