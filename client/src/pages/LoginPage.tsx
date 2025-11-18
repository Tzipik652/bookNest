import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { BookOpen } from "lucide-react";

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
  Divider,
  CircularProgress,
} from "@mui/material";

import { useUserStore } from "../store/useUserStore";
import { loginLocal, loginWithGoogle } from "../services/userService";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas/login.schema";

export function LoginPage() {
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
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      const result = await loginLocal(data.email, data.password);
      if (result) {
        const { user, token } = result;
        login(user, token);
        navigate(getRedirectPath());
      }
    } catch (err: any) {
      setError("Invalid email or password || " + err.toString());
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setError("");
    try {
      const result = await loginWithGoogle(credentialResponse);
      if (result) {
        const { user, token } = result;
        login(user, token);
        navigate(getRedirectPath());
      }
    } catch (err) {
      console.error(err);
      setError("Google login error");
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
                <BookOpen
                  size={48}
                  color="#16A34A"
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h5" fontWeight="bold">
                  Welcome Back to BookNest
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to access your library
                </Typography>
              </Box>
            }
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
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
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <Divider sx={{ my: 1 }}>or</Divider>

              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login failed")}
              />

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  style={{ color: "#16A34A", textDecoration: "none" }}
                >
                  Register here
                </Link>
              </Typography>
            </CardActions>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
