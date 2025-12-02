import { useState, useRef, ChangeEvent, useEffect } from "react"; // Added ChangeEvent
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  IconButton, // Added
  InputAdornment,
  CardHeader, // Added
} from "@mui/material";
import { Button as ShadcnButton } from "../components/ui/button";
import { ArrowBack, AutoAwesome, CheckCircle, CloudUpload } from "@mui/icons-material"; // Added CloudUpload
import { useUserStore } from "../store/useUserStore";
import { Category } from "../types";
import { useKeyboardModeBodyClass } from "../hooks/useKeyboardMode";
import { useForm } from "react-hook-form";
import { BookFormValues, bookSchema } from "../schemas/book.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME; 
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET; 
import { addBook } from "../services/bookService";
import { getCategories } from "../services/categoryService";

export function AddBookPage() {
  const isKeyboardMode = useKeyboardModeBodyClass();
  const { t } = useTranslation(["addBook", "common"]);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State להעלאת תמונה
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, // אנחנו צריכים את זה כדי לעדכן את השדה ידנית
    watch, // כדי לראות שינויים
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

  // פונקציה להעלאת התמונה ל-Cloudinary
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      // העדכון הקריטי: אנחנו מכניסים את ה-URL שהתקבל לתוך הטופס
      setValue("img_url", data.secure_url);
      setImagePreview(data.secure_url); // מציג תצוגה מקדימה למשתמש
      toast.success(t("successUpload"));

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("errorUpload"));
    } finally {
      setUploadingImage(false);
    }
  };

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

  const onSubmit = async (data: BookFormValues) => {
    setIsSubmitting(true);
    actionsRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const newBook = await addBook({
        title: data.title,
        author: data.author,
        description: data.description,
        category: data.category,
        img_url: data.img_url || "https://images.unsplash.com/photo-1560362415-c88a4c066155",
        price: data.price ? parseFloat(data.price) : undefined,
      });

      toast.success(t('successMessage', { bookTitle: newBook.title }));
      reset();
      setImagePreview(null); // איפוס התצוגה המקדימה

      setTimeout(() => {
        navigate(`/book/${newBook._id}`);
      }, 1500);
    } catch (err: any) {
      // ... (הקוד הקיים שלך לטיפול בשגיאות)
      toast.error(t("errorGeneral"));
      setIsSubmitting(false);
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" py={6} component="main">
      <Box maxWidth="sm" mx="auto" px={2}>
        {/* ... כפתור חזרה הקיים שלך ... */}
          <ArrowBack className="h-4 w-4" /> {t('common:back')}
        <ShadcnButton
          variant="ghost"
          onClick={() => navigate(-1)}
          aria-label={t("common:back")}
          className="mb-6 gap-2"
        >
          {t('common:dir') === 'rtl' ? <ArrowRight className="h-4 w-4" /> : null}
          {t('common:dir') === 'ltr' ? <ArrowLeft className="h-4 w-4" /> : null}
          {t('common:back')}
        </ShadcnButton>
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("pageTitle")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t("pageSubheader")}
        </Typography>

        <Card elevation={3}>
          <CardHeader className="notranslate" title={t("pageTitle")} subheader={t("pageSubheader")} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              {/* ... שדות קיימים (Title, Author, Description, Category) ... */}
              <TextField fullWidth label={t("titleLabel")} margin="normal" {...register("title")} error={!!errors.title} helperText={errors.title?.message} />
              <TextField
                fullWidth
                label={t("authorLabel")}
                margin="normal"
                {...register("author")}
                error={!!errors.author}
                helperText={errors.author?.message} />
              <TextField
                fullWidth
                className="notranslate"
                label={t("descriptionLabel")}
                margin="normal"
                multiline // מאפשר כמה שורות
                rows={5}   // גודל ברירת מחדל של 5 שורות
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
                onKeyDown={(e) => {
                  // מונע שליחת טופס בלחיצה על Enter, אבל מאפשר שורות חדשות עם Shift+Enter
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
                  }
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* --- החלק החדש של העלאת תמונה --- */}
              <Box sx={{ mt: 2, mb: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="raised-button-file">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUpload />}
                    disabled={uploadingImage}
                     sx={{
                  gap: 1, 
                  "& .MuiButton-endIcon": {
                    margin: 0, 
                  },
                  alignItems: "center",
                }}
                  >
                    {uploadingImage ? t("uploading") : t("uploadButton")}
                    
                  </Button>
                </label>

                {/* תצוגה מקדימה אם יש תמונה */}
                {imagePreview && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: 200, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    />
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                className="notranslate"
                label={t("imageURLLabel")}
                margin="normal"
                {...register("img_url")}
                // אם רוצים שזה יהיה לקריאה בלבד אחרי העלאה:
                InputProps={{
                  readOnly: !!imagePreview
                }}
                InputLabelProps={{ shrink: true }} // כדי שהלייבל לא יכסה את הטקסט
                error={!!errors.img_url}
                helperText={errors.img_url?.message}
              />
              {/* ------------------------------------- */}

              <TextField fullWidth label={t("priceLabel")} type="number" margin="normal" {...register("price")} error={!!errors.price} helperText={errors.price?.message} />

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
                aria-label={t("addButton")}
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
                aria-label={t("cancelButton")}
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