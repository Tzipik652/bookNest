import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CommentSection } from "../components/CommentSection";
import { deleteBook, getBookById } from "../services/bookService";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  ArrowBack,
  Edit,
  Delete,
  AutoAwesome,
} from "@mui/icons-material";
import { useUserStore } from "../store/useUserStore";
import { useFavoriteBooks } from "../hooks/useFavorites";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useDynamicTheme } from "../theme";
import { Book, BookWithFavorite } from "../types";

export function BookDetailsPage() {
  const theme = useDynamicTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { user: currentUser } = useUserStore();
  const { toggleMutation, isFavorited } = useFavoriteBooks();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: fetchedBook,
    isLoading,
    error,
  } = useQuery<Book>({
    queryKey: ["book", id],
    queryFn: () => getBookById(id || ""),
    enabled: !!id && id !== "deleted",
  });

  const cachedBook = queryClient.getQueryData<BookWithFavorite>(["book", id]);

  const book: BookWithFavorite | undefined = fetchedBook
    ? { ...fetchedBook, isFavorited: isFavorited(fetchedBook._id) }
    : cachedBook;

  if (isLoading) {
    return (
      <Box p={4}>
        <Skeleton variant="rectangular" width="100%" height={400} />
        <Skeleton width="60%" height={50} sx={{ mt: 2 }} />
        <Skeleton width="40%" height={40} />
        <Skeleton width="80%" height={30} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!book) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h5">Book Not Found</Typography>
      </Box>
    );
  }

  const isOwner = currentUser?._id === book.user_id;

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      const encoded = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${encoded}`);
      return;
    }
    toggleMutation.mutate(book._id);
  };

  const handleDelete = async () => {
    await deleteBook(book._id);
    queryClient.removeQueries({ queryKey: ["book", book._id] });
    navigate("/my-books");
  };

  return (
    <Box
      style={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
      minHeight="100vh"
      py={6}
    >
      <Box maxWidth="md" mx="auto" px={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="text"
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
          <Box flex={1}>
            <Card>
              <CardMedia
                component="img"
                image={book.img_url}
                alt={book.title}
                sx={{ aspectRatio: "3/4", objectFit: "cover" }}
              />
            </Card>
          </Box>

          <Box flex={1}>
            <Card elevation={0} sx={{ bgcolor: "transparent" }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {book.title}
                </Typography>

                <Typography variant="h6" color="text.secondary" gutterBottom>
                  by {book.author}
                </Typography>

                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Chip label={book.category} variant="outlined" />

                  {book.price && (
                    <Typography variant="h6">
                      ${book.price.toFixed(2)}
                    </Typography>
                  )}
                </Box>

                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                  <Button
                    variant={book.isFavorited ? "contained" : "outlined"}
                    color="primary"
                    startIcon={
                      book.isFavorited ? <Favorite /> : <FavoriteBorder />
                    }
                    onClick={handleFavoriteToggle}
                    disabled={toggleMutation.isPending}
                  >
                    {book.isFavorited
                      ? "Remove from Favorites"
                      : "Add to Favorites"}
                  </Button>

                  {isOwner && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/edit-book/${book._id}`)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {book.favorites_count} users liked this book
                </Typography>

                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  {book.description}
                </Typography>

                <Box p={3} borderRadius={2} border="1px solid #e0e0e0" mb={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AutoAwesome color="primary" />
                    <Typography variant="h6">AI Summary</Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {book.ai_summary}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Uploaded by {book.user?.name}
                  <br />
                  {new Date(book.date_created).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <Box mt={8}>
        <CommentSection bookId={book._id} bookOwnerId={book.user_id} />
      </Box>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete "{book.title}". This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
