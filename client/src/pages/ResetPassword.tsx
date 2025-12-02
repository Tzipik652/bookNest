import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordFormValues, resetPasswordSchema } from "../schemas/auth.register";
import { resetPassword } from "../services/authService";
import { Book, Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function ResetPassword() {
  const isKeyboardMode = useKeyboardModeBodyClass();
  const { t } = useTranslation("auth");
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError("");
    setMessage("");
    try {
      await resetPassword(token!, data.password);
      setMessage(t("resetPassword.successMessage"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(t("resetPassword.errorToken"));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #eff6ff, #ede9fe)",
        p: 2,
      }}
      dir={t("dir")}
    >
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 3 }}>
        <CardHeader
          title={
            <Box textAlign="center">
              <Book sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {t("resetPassword.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("resetPassword.subtitle")}
              </Typography>
            </Box>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <TextField
              label={t("resetPassword.newPasswordLabel")}
              type={showPassword ? "text" : "password"}
              fullWidth
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ?t("hidePassword") :t("showPassword")}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("resetPassword.confirmPasswordLabel")}
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label={showConfirmPassword ?t("hidePassword") :t("showPassword")}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>

          <CardActions
            sx={{
              flexDirection: "column",
              alignItems: "stretch",
              gap: 2,
              p: 2,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              aria-label={isSubmitting
                ? t("resetPassword.updatingButton")
                : t("resetPassword.submitButton")}
            >
             {isSubmitting
                ? t("resetPassword.updatingButton")
                : t("resetPassword.submitButton")}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              {t("resetPassword.loginLinkText")}{" "}
              <Link to="/login" style={{ color: "#16A34A", textDecoration: "none" }}>
                {t("resetPassword.loginLink")}
              </Link>
            </Typography>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}
