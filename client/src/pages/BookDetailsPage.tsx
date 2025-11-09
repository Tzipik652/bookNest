import { useParams, useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import { Book } from "../types";
import { isFavorite, toggleFavorite } from "../services/favoriteService";
import { getBookById, deleteBook } from "../services/bookService";
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

export function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();

  const [book, setBook] = useState<Book | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(id ? isFavorite(id) : false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchBook = async () => {
      try {
        console.log("Fetching book with id:", id);
        const data = await getBookById(id);
        setBook(data);
      } catch (err) {
        console.error(err);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Typography>Loading...</Typography>
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
        <Box textAlign="center">
          <Typography variant="h5" mb={2}>
            Book Not Found
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  const isOwner = currentUser?._id === book.uploaderId;

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const newState = toggleFavorite(book._id);
    setFavorited(newState);
  };

  const handleDelete = () => {
    deleteBook(book._id);
    navigate("/my-books");
  };

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" py={6}>
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
          {/* Book Cover */}
          <Box flex={1}>
            <Card sx={{ overflow: "hidden" }}>
              <CardMedia
                component="img"
                image={book.img_url}
                alt={book.title}
                sx={{ aspectRatio: "3 / 4", objectFit: "cover" }}
              />
            </Card>
          </Box>

          {/* Book Details */}
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
                  <Chip
                    label={book.category}
                    color="default"
                    variant="outlined"
                  />
                  {book.price && (
                    <Typography variant="h6">
                      ${book.price.toFixed(2)}
                    </Typography>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                  <Button
                    variant={favorited ? "contained" : "outlined"}
                    color="primary"
                    startIcon={favorited ? <Favorite /> : <FavoriteBorder />}
                    onClick={handleFavoriteToggle}
                  >
                    {favorited ? "Remove from Favorites" : "Add to Favorites"}
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

                {/* Description */}
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {book.description}
                  </Typography>
                </Box>

                {/* AI Summary */}
                <Box
                  p={3}
                  borderRadius={2}
                  border="1px solid #e0e0e0"
                  sx={{
                    background: "linear-gradient(135deg, #eef2ff, #f3e8ff)",
                  }}
                  mb={3}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AutoAwesome color="primary" />
                    <Typography variant="h6">AI Summary</Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {book.ai_summary}
                  </Typography>
                </Box>

                {/* Uploader Info */}
                <Typography variant="body2" color="text.secondary">
                  Uploaded by {book.user.name}
                  <br />
                  {new Date(book.date_created).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete "{book.title}" from your library. This
            action cannot be undone.
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
