import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { Controller, useForm } from "react-hook-form";
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
import { Category } from '../types';
import { useTranslation } from 'react-i18next';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button as ShadcnButton } from "../components/ui/button";


export function EditBookPage() {
  const { t } = useTranslation(['editBook', 'common']);
  const isKeyboardMode = useKeyboardModeBodyClass();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useUserStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");

  const handleNavigateBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/book/${id}`);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty }
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

        const isOwner = book.user_id === currentUser?._id;
        const isAdmin = currentUser?.role === 'admin';

        if (!isOwner && !isAdmin) {
          navigate(`/book/${id}`);
          return;
        }

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
  }, [id, currentUser, navigate, setValue]);

  const onSubmit = async (data: BookFormValues) => {
    setSubmitError("");

    if (!isDirty) {
      console.log("No changes — skipping update");
      handleNavigateBack();
      return;
    }

    try {
      await updateBook(id!, {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
      });

      handleNavigateBack();

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
         <ShadcnButton
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          {t('common:dir') === 'rtl' ? <ArrowRight className="h-4 w-4" /> : null}
          {t('common:dir') === 'ltr' ? <ArrowLeft className="h-4 w-4" /> : null}
          {t('common:back')}
        </ShadcnButton>

        <Card sx={{ p: 2 }}>
          <CardHeader title={t('editBook:pageTitle')} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {submitError && <Alert severity="error">{submitError}</Alert>}

              <TextField
                label={t('editBook:form.title')}
                required
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />

              <TextField
                label={t('editBook:form.author')}
                required
                {...register("author")}
                error={!!errors.author}
                helperText={errors.author?.message}
              />

              <TextField
                label={t('editBook:form.description')}
                required
                multiline
                rows={5}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              <Controller
                name="category"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('editBook:form.category')}
                    required
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {categories.map((cat: any) => (
                      <MenuItem key={cat.id || cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <TextField
                label={t('editBook:form.imageUrl')}
                {...register("img_url")}
                error={!!errors.img_url}
                helperText={errors.img_url?.message}
              />

              <TextField
                label={t('editBook:form.price')}
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
                disabled={!isDirty || isSubmitting}
              >
                {isSubmitting ? t('common:saving') : t('common:buttonSaveChanges')}
              </Button>

              {/* כפתור ביטול שמשתמש גם הוא בניווט החכם */}
              <Button variant="outlined" fullWidth onClick={handleNavigateBack}>
                {t('common:buttonCancel')}
              </Button>
            </CardActions>
          </form>
        </Card>
      </Container>
    </Box>
  );
}