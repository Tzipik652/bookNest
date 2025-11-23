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
import { ArrowBack, AutoAwesome, CheckCircle } from "@mui/icons-material";
import { useUserStore } from "../store/useUserStore";
import { Category } from "../types";

import { useForm } from "react-hook-form";
import { BookFormValues, bookSchema } from "../schemas/book.schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function AddBookPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user: currentUser } = useUserStore();

  const [categories, setCategories] = useState<Category[]>([]);

  // --------------------
  // RHF + ZOD
  // --------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      category: "",
      img_url: "",
      price: "",
    },
  });

  // Load categories
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

  // Submit handler
  const onSubmit = async (data: BookFormValues) => {
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const newBook = await addBook({
        title: data.title,
        author: data.author,
        description: data.description,
        category: data.category,
        img_url:
          data.img_url ||
          "https://images.unsplash.com/photo-1560362415-c88a4c066155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        price: data.price ? parseFloat(data.price) : undefined,
      });

      setSuccessMessage(`${newBook.title} was added successfully!`);
      setShowSuccess(true);

      reset();

      setTimeout(() => {
        navigate(`/book/${newBook._id}`);
      }, 1500);
    } catch (err: any) {
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Alert
                icon={<AutoAwesome fontSize="small" sx={{ color: "#16A34A" }} />}
                severity="info"
                sx={{ mb: 3 }}
              >
                AI will automatically generate a summary based on your title,
                description, and category.
              </Alert>

              <TextField
                fullWidth
                label="Title *"
                margin="normal"
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />

              <TextField
                fullWidth
                label="Author *"
                margin="normal"
                {...register("author")}
                error={!!errors.author}
                helperText={errors.author?.message}
              />

              <TextField
                fullWidth
                label="Description *"
                margin="normal"
                multiline
                rows={5}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              <TextField
                select
                fullWidth
                label="Category *"
                margin="normal"
                {...register("category")}
                error={!!errors.category}
                helperText={errors.category?.message}
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
                margin="normal"
                {...register("img_url")}
                error={!!errors.img_url}
                helperText={errors.img_url?.message}
              />

              <TextField
                fullWidth
                label="Price (Optional)"
                type="number"
                margin="normal"
                {...register("price")}
                error={!!errors.price}
                helperText={errors.price?.message}
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
                  isSubmitting ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null
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

      <Snackbar
        open={showAlert}
        autoHideDuration={4000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          icon={<CheckCircle fontSize="inherit" />}
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
