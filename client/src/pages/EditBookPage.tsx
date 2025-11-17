import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { bookSchema, BookFormValues } from "../schemas/book.schema";
import { getBookById, updateBook } from '../services/bookService';
import { getCategories } from "../services/categoryService";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Container,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useUserStore } from '../store/useUserStore';

export function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");

  // 🎯 RHF + Zod
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [book, cats] = await Promise.all([
          getBookById(id),
          getCategories(),
        ]);

        setCategories(cats);

        if (!book) {
          navigate('/home');
          return;
        }

        if (book.user_id !== currentUser?._id) {
          navigate(`/book/${id}`);
          return;
        }

        // ✔ מילוי נתוני הספר לתוך הטופס
        Object.entries(book).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            setValue(key as keyof BookFormValues, String(value));
          }
        });

      } catch (err) {
        console.error(err);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const onSubmit = async (data: BookFormValues) => {
    setSubmitError("");

    try {
      await updateBook(id!, {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
      });

      navigate(`/book/${id}`);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to update book. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Card sx={{ p: 2 }}>
          <CardHeader title="Edit Book" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {submitError && <Alert severity="error">{submitError}</Alert>}

              <TextField
                label="Title *"
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />

              <TextField
                label="Author *"
                {...register("author")}
                error={!!errors.author}
                helperText={errors.author?.message}
              />

              <TextField
                label="Description *"
                multiline
                rows={5}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              <TextField
                select
                label="Category *"
                {...register("category")}
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                {categories.map((cat: any) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Image URL"
                {...register("img_url")}
                error={!!errors.img_url}
                helperText={errors.img_url?.message}
              />

              <TextField
                label="Price (Optional)"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                {...register("price")}
                error={!!errors.price}
                helperText={errors.price?.message}
              />

            </CardContent>

            <CardActions sx={{ gap: 2, px: 3, pb: 3 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>

              <Button variant="outlined" fullWidth onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
