import { useState, useRef, ChangeEvent, useEffect } from "react";
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Button as ShadcnButton } from "../components/ui/button";
import {
  CloudUpload,
  Delete,
  Close
} from "@mui/icons-material";
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
    setValue, // כדי לעדכן את השדה img_url
    watch,   // כדי לראות שינויים בשדה img_url
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

  // --- לוגיקה חדשה ---
  const watchedImgUrl = watch("img_url"); // עוקב אחרי הערך ב-TextField

  // פונקציה להסרת התמונה/הקישור
  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue("img_url", "", { shouldValidate: true }); // מנקה את השדה בטופס
    // איפוס ה-input של הקובץ כדי שאפשר יהיה להעלות שוב
    const fileInput = document.getElementById("raised-button-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // פונקציה להעלאת התמונה ל-Cloudinary
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ניתן להוסיף כאן בדיקת גודל/סוג קובץ

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

      // העדכון: מכניסים את ה-URL שהתקבל לתוך הטופס
      setValue("img_url", data.secure_url, { shouldValidate: true });
      setImagePreview(data.secure_url);
      toast.success(t("successUpload"));

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("errorUpload"));
      handleRemoveImage(); // לנקות את הכל במקרה של כישלון
    } finally {
      setUploadingImage(false);
    }
  };

  // אפקט להצגת תצוגה מקדימה גם כאשר המשתמש מזין URL ידנית
  useEffect(() => {
    if (watchedImgUrl) {
      if (watchedImgUrl !== imagePreview) {
        setImagePreview(watchedImgUrl);
      }
    } else {
      setImagePreview(null);
    }
  }, [watchedImgUrl]);


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
      toast.error(t("errorGeneral"));
      setIsSubmitting(false);
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" py={6} component="main">
      <Box maxWidth="sm" mx="auto" px={2}>

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
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
                multiline
                rows={5}
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

              {/* --- החלק המעודכן של העלאת תמונה --- */}
              <Box sx={{ mt: 2, mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleImageUpload}
                  disabled={!!imagePreview || uploadingImage} // הוספנו disabled אם יש תצוגה מקדימה
                />

                {/* כפתור העלאה - מוצג רק אם אין תמונה */}
                {!imagePreview && (
                  <label htmlFor="raised-button-file">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUpload />}
                      disabled={uploadingImage}
                      sx={{ py: 1.5, borderStyle: 'dashed' }}
                    >
                      {uploadingImage ? t("uploading") : t("uploadButton")}
                    </Button>
                  </label>
                )}

                {/* תצוגה מקדימה + כפתור מחיקה */}
                {imagePreview && (
                  <Box position="relative" mt={2} display="inline-flex">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxHeight: 200,
                        maxWidth: "100%",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    {/* כפתור מחיקה צף על התמונה */}
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      title={t("removeImage", { defaultValue: "remove image" })}
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        bgcolor: "background.paper",
                        boxShadow: 2,
                        "&:hover": { bgcolor: "error.light", color: "white" }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                className="notranslate"
                label={t("imageURLLabel")}
                margin="normal"
                {...register("img_url")}

                // לוגיקה לנעילת השדה
                disabled={!!imagePreview && watchedImgUrl === imagePreview}

                InputLabelProps={{ shrink: true }}
                error={!!errors.img_url}

                // הודעה דינמית למשתמש
                helperText={
                  errors.img_url?.message ||
                  (imagePreview && watchedImgUrl === imagePreview
                    ? t("urlLockedMessage", {
                      defaultValue: "The link was locked after uploading the image. Use the delete button to change it."
                    })
                    : t("urlHelpText", { defaultValue: "Insert a link to an image or upload a file" }))
                }

                // כפתור מחיקה בתוך השדה
                InputProps={{
                  endAdornment: watchedImgUrl ? (
                    <InputAdornment position="end">
                      <IconButton onClick={handleRemoveImage} edge="end" title={t("removeImage")}>
                        <Delete color="error" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />

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