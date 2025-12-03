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
  CircularProgress,
  IconButton,
  InputAdornment,
  CardHeader,
} from "@mui/material";
import { Button as ShadcnButton } from "../components/ui/button";
import {
  CloudUpload,
  Delete,
  Close
} from "@mui/icons-material";
import { Category } from "../types";
import { useKeyboardModeBodyClass } from "../hooks/useKeyboardMode";
import { useForm } from "react-hook-form";
import { BookFormValues, createBookSchema } from "../schemas/book.schema";
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
  const { t } = useTranslation(["addBook", "common", "validation", "category"]);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  
  // יצירת הסכימה עם ה-t
  const formSchema = createBookSchema(t);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BookFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      category: "",
      img_url: "",
      price: "",
    },
  });

  const watchedImgUrl = watch("img_url");

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue("img_url", "", { shouldValidate: true });
    const fileInput = document.getElementById("raised-button-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

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

      setValue("img_url", data.secure_url, { shouldValidate: true });
      setImagePreview(data.secure_url);
      toast.success(t("successUpload"));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("errorUpload"));
      handleRemoveImage();
    } finally {
      setUploadingImage(false);
    }
  };

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
        img_url:
          data.img_url ||
          "https://images.unsplash.com/photo-1560362415-c88a4c066155",
        price: data.price ? parseFloat(data.price) : undefined,
      });

      toast.success(t("successMessage", { bookTitle: newBook.title }));
      reset();
      setImagePreview(null);

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
          {t("common:dir") === "rtl" ? (
            <ArrowRight className="h-4 w-4" />
          ) : null}
          {t("common:dir") === "ltr" ? <ArrowLeft className="h-4 w-4" /> : null}
          {t("common:back")}
        </ShadcnButton>

        <Card elevation={3}>
          {/* Form מתחיל כאן פעם אחת בלבד */}
          <form onSubmit={handleSubmit(onSubmit)}>
            
            <CardHeader
              className="notranslate"
              title={t("pageTitle")}
              subheader={t("pageSubheader")}
            />

            <CardContent>
              {/* Title Field */}
              <TextField
                fullWidth
                label={t("titleLabel")}
                margin="normal"
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />

              {/* Author Field */}
              <TextField
                fullWidth
                label={t("authorLabel")}
                margin="normal"
                {...register("author")}
                error={!!errors.author}
                helperText={errors.author?.message}
              />

              {/* Description Field */}
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

              {/* Category Field */}
              <TextField
                select
                fullWidth
                className="notranslate"
                label={t("categoryLabel")}
                margin="normal"
                {...register("category")}
                value={watch("category") || ""}
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {t(`category:${cat.name.replace(/\s+/g, "")}`)}{" "}
                  </MenuItem>
                ))}
              </TextField>

              {/* Image Upload Logic */}
              <Box sx={{ mt: 2, mb: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleImageUpload}
                  disabled={!!imagePreview || uploadingImage}
                />

                {/* Upload Button */}
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

                {/* Preview */}
                {imagePreview && (
                  <Box position="relative" mt={2} display="inline-flex">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxHeight: 200,
                        maxWidth: "100%",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      title={t("removeImage")}
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

              {/* Image URL Field */}
              <TextField
                fullWidth
                className="notranslate"
                label={t("imageURLLabel")}
                margin="normal"
                {...register("img_url")}
                disabled={!!imagePreview && watchedImgUrl === imagePreview}
                InputProps={{
                  readOnly: !!imagePreview,
                  endAdornment: watchedImgUrl ? (
                    <InputAdornment position="end">
                      <IconButton onClick={handleRemoveImage} edge="end" title={t("removeImage")}>
                        <Delete color="error" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.img_url}
                helperText={
                  errors.img_url?.message ||
                  (imagePreview && watchedImgUrl === imagePreview
                    ? t("urlLockedMessage", {
                      defaultValue: "The link was locked after uploading the image."
                    })
                    : t("urlHelpText", { defaultValue: "Insert a link to an image or upload a file" }))
                }
              />

              {/* Price Field */}
              <TextField
                fullWidth
                label={t("priceLabel")}
                type="number"
                margin="normal"
                {...register("price")}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            </CardContent>

            {/* Actions */}
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