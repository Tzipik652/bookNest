import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import BookIcon from "@mui/icons-material/Book";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useUserStore } from "../store/useUserStore";
import { register } from "../services/userService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRegisterSchema, RegisterFormValues } from "../schemas/register.schema"; 
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';

export function RegisterPage() {
  const { t } = useTranslation(["auth", "common", "validation"]);
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUserStore();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 1. זיהוי כיוון השפה
  const isRtl = t("dir") === "rtl";
  
  const schema = createRegisterSchema(t);

  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    return redirect ? decodeURIComponent(redirect) : "/home";
  };

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    try {
      const { user, token } = await register(data.email, data.password, data.name);
      login(user, token);
      navigate(getRedirectPath());
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || "";

        if (status === 400 && message.includes("User already exists")) {
          setError(t("register.errorExists"));
        } else {
          setError(t("register.errorGeneral"));
        }
      } else {
        setError(t("register.errorGeneral"));
      }
    }
  };

  // אובייקט עיצוב משותף לכל השדות למניעת חזרות בקוד
  const commonTextFieldStyles = {
    "& .MuiOutlinedInput-root": {
       flexDirection: isRtl ? "row-reverse" : "row",
    },
    "& .MuiOutlinedInput-input": {
        textAlign: isRtl ? "right" : "left",
    }
  };

  const commonLabelProps = {
    sx: {
      transformOrigin: isRtl ? "right top" : "left top",
      left: isRtl ? "auto" : 0,
      right: isRtl ? 0 : "auto",
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #eff6ff, #ede9fe)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
      dir={t("dir")}
    >
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 3 }}>
        <CardHeader
          title={
            <Box textAlign="center">
              <BookIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {t("register.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("register.subtitle")}
              </Typography>
            </Box>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* --- שם מלא --- */}
            <TextField
              label={t("register.nameLabel")}
              fullWidth
              {...formRegister("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              
              // תיקוני RTL
              dir={isRtl ? "rtl" : "ltr"}
              InputLabelProps={commonLabelProps}
              sx={commonTextFieldStyles}
            />

            {/* --- אימייל --- */}
            <TextField
              label={t("register.emailLabel")}
              type="email"
              fullWidth
              {...formRegister("email")}
              error={!!errors.email}
              helperText={errors.email?.message}

              // תיקוני RTL
              dir={isRtl ? "rtl" : "ltr"}
              InputLabelProps={commonLabelProps}
              sx={commonTextFieldStyles}
            />

            {/* --- סיסמה --- */}
            <TextField
              label={t("register.passwordLabel")}
              type={showPassword ? "text" : "password"}
              fullWidth
              {...formRegister("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              
              // תיקוני RTL
              dir={isRtl ? "rtl" : "ltr"}
              InputLabelProps={commonLabelProps}
              sx={commonTextFieldStyles}

              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label={showPassword ? t("hidePassword") : t("showPassword")}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* --- אימות סיסמה --- */}
            <TextField
              label={t("register.confirmPasswordLabel")}
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              {...formRegister("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              
              // תיקוני RTL
              dir={isRtl ? "rtl" : "ltr"}
              InputLabelProps={commonLabelProps}
              sx={commonTextFieldStyles}

              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}>
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
              sx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
              }}
              disabled={isSubmitting}
              aria-label={isSubmitting
                ? t("register.registeringButton")
                : t("register.submitButton")}
            >
              {isSubmitting
                ? t("register.registeringButton")
                : t("register.submitButton")}
            </Button>

            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
            >
              {t("register.hasAccountText")}{" "}
              <Link
                to="/login"
                style={{ color: "#16A34A", textDecoration: "none" }}
              >
                {t("register.loginLink")}
              </Link>
            </Typography>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}