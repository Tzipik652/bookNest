import { useEffect, useState, useRef } from "react";
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
import { Button as ShadcnButton } from "../components/ui/button";
import { ArrowBack, AutoAwesome, CheckCircle } from "@mui/icons-material";
import { useUserStore } from "../store/useUserStore";
import { Category } from "../types";
import { useKeyboardModeBodyClass } from "../hooks/useKeyboardMode";
import { useForm } from "react-hook-form";
import { BookFormValues, bookSchema } from "../schemas/book.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function AddBookPage() {
  const isKeyboardMode = useKeyboardModeBodyClass();
  const { t } = useTranslation(["addBook", "common"]);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const actionsRef = useRef<HTMLDivElement | null>(null);

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
    setIsSubmitting(true);
    actionsRef.current?.scrollIntoView({ behavior: "smooth" });
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

      toast.success(t('successMessage', { bookTitle: newBook.title }));

      reset();

      setTimeout(() => {
        navigate(`/book/${newBook._id}`);
      }, 1500);
    } catch (err: any) {
      if (err.message === "Book already exists.") {
        toast.error(t("errorBookExists"));
        // setError(t('errorBookExists'));
      } else {
        toast.error(t("errorGeneral"));
        // setError(t('errorGeneral'));
      }

      // setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" py={6}>
      <Box maxWidth="sm" mx="auto" px={2}>
        <ShadcnButton
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          {t('common:dir') === 'rtl' ? <ArrowRight className="h-4 w-4" /> : null}
          {t('common:dir') === 'ltr' ? <ArrowLeft className="h-4 w-4" /> : null}
          {t('common:back')}
        </ShadcnButton>


        <Card elevation={3}>
          <CardHeader
            className="notranslate"
            title={t("pageTitle")}
            subheader={t("pageSubheader")}
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Alert
                icon={
                  <AutoAwesome fontSize="small" sx={{ color: "#16A34A" }} />
                }
                severity="info"
                sx={{ mb: 3 }}
                className="notranslate"
              >
                {t("aiAlert")}
              </Alert>

              <TextField
                fullWidth
                className="notranslate"
                label={t("titleLabel")}
                margin="normal"
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
              />

              <TextField
                fullWidth
                className="notranslate"
                label={t("authorLabel")}
                margin="normal"
                {...register("author")}
                error={!!errors.author}
                helperText={errors.author?.message}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
              />

              <TextField
                fullWidth
                className="notranslate"
                label={t("descriptionLabel")}
                margin="normal"
                multiline
                rows={5}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
              />

              <TextField
                select
                fullWidth
                className="notranslate"
                label={t("categoryLabel")}
                margin="normal"
                {...register("category")}
                error={!!errors.category}
                helperText={errors.category?.message}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                className="notranslate"
                label={t("imageURLLabel")}
                margin="normal"
                {...register("img_url")}
                error={!!errors.img_url}
                helperText={errors.img_url?.message}
              />

              <TextField
                fullWidth
                className="notranslate"
                label={t("priceLabel")}
                type="number"
                margin="normal"
                {...register("price")}
                error={!!errors.price}
                helperText={errors.price?.message}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
              />
            </CardContent>

            <CardActions ref={actionsRef} sx={{ p: 3, pt: 0, gap: 2 }}>
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
                className="notranslate"
              >
                {isSubmitting ? t("addingButton") : t("addButton")}
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="notranslate"
              >
                {t("cancelButton")}
              </Button>
            </CardActions>
          </form>
        </Card>
      </Box>
    </Box>
  );
}
