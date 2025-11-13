import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { addBook } from "../services/bookService";
import { getCategories } from "../services/categoryService";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { ArrowBack, AutoAwesome, CheckCircle } from '@mui/icons-material';
import { useUserStore } from "../store/useUserStore";
import { Category } from '../types';

export function AddBookPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [img_url, setImg_url] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user: currentUser } = useUserStore();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!title || !author || !description || !category) {
      setError("Please fill in all required fields");
      setShowAlert(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const newBook = await addBook({
        title,
        author,
        description,
        category,
        imgUrl:
          img_url ||
          "https://images.unsplash.com/photo-1560362415-c88a4c066155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        price: price ? parseFloat(price) : undefined,
      });

      setSuccessMessage(`${newBook.title} was added successfully!`);
      setShowSuccess(true);

      setTimeout(() => {
        navigate(`/book/${newBook._id}`);
      }, 1500);
    } catch (err: any) {
      console.log(err);

      if (err.message === "Book already exists.") {
        setError("This book already exists in the database.");
      } else {
        setError("Failed to add book. Please try again.");
      }

      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" py={6}>
      <Box maxWidth="sm" mx="auto" px={2}>
        <Button
          startIcon={<ArrowBack />}
          variant="text"
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Card elevation={3}>
          <CardHeader
            title="Add New Book"
            subheader="Share a book with the BookNest community. AI will generate a summary automatically."
          />

          <form onSubmit={handleSubmit}>
            <CardContent>
              <Alert
                icon={<AutoAwesome fontSize="small" sx={{ color: '#16A34A' }} />}
                severity="info"
                sx={{
                  mb: 3,
                  background: "linear-gradient(to right, #dffdd7ff, #cee4b1ff)",
                }}
              >
                AI will automatically generate a summary based on your title,
                description, and category.
              </Alert>

              <TextField
                fullWidth
                label="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Author *"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Description *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                required
                multiline
                rows={5}
              />

              <TextField
                select
                fullWidth
                label="Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                margin="normal"
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Image URL (Optional)"
                value={img_url}
                onChange={(e) => setImg_url(e.target.value)}
                type="url"
                margin="normal"
                helperText="Leave blank to use a default image"
              />

              <TextField
                fullWidth
                label="Price (Optional)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                margin="normal"
              />
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0, gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
                }
              >
                {isSubmitting ? "Adding Book..." : "Add Book"}
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Box>

      {/*  error message*/}
      <Snackbar
        open={showAlert}
        autoHideDuration={4000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/*  success message */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          icon={<CheckCircle fontSize="inherit" />}
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
