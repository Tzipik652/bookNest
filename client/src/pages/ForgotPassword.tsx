import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "@mui/material";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "../schemas/auth.register";
import { forgotPassword } from "../services/authService";


export function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError("");
    setMessage("");
    try {
      await forgotPassword(data.email);
      setMessage("If the email exists, a reset link was sent.");
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        bgcolor: "linear-gradient(to bottom right, #eff6ff, #f3e8ff)",
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>
          <CardHeader
            title={
              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold" mb={1}>
                  Forgot Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your email to reset your password
                </Typography>
              </Box>
            }
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {error && <Alert severity="error">{error}</Alert>}
              {message && <Alert severity="success">{message}</Alert>}

              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </CardContent>

            <CardActions sx={{ flexDirection: "column", gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Remembered your password?{" "}
                <Link to="/login" style={{ color: "#16A34A", textDecoration: "none" }}>
                  Login here
                </Link>
              </Typography>
            </CardActions>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
