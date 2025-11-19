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


export function ResetPassword() {
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
      setMessage("Password successfully updated!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError("Invalid or expired token.");
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
    >
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 3 }}>
        <CardHeader
          title={
            <Box textAlign="center">
              <Book sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your new password below
              </Typography>
            </Box>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <TextField
              label="New Password"
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
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
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
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              Remembered your password?{" "}
              <Link to="/login" style={{ color: "#16A34A", textDecoration: "none" }}>
                Login here
              </Link>
            </Typography>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}
