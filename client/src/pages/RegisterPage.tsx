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
} from "@mui/material";

import { useUserStore } from "../store/useUserStore";
import { register } from "../services/userService";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas/register.schema";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUserStore();
  const [error, setError] = useState("");

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
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    try {
      const { user, token } = await register(data.email, data.password, data.name);
      login(user, token);
      navigate(getRedirectPath());
    } catch (err: any) {
      // טיפול ידידותי בשגיאות מהשרת
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || "";

        if (status === 400 && message.includes("User already exists")) {
          setError("This email is already registered.");
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
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
    >
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 3 }}>
        <CardHeader
          title={
            <Box textAlign="center">
              <BookIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                Join BookNest
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create an account to start your reading journey
              </Typography>
            </Box>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Full Name"
              fullWidth
              {...formRegister("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              {...formRegister("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              {...formRegister("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              {...formRegister("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
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
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>

            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ color: "#16A34A", textDecoration: "none" }}
              >
                Login here
              </Link>
            </Typography>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}
