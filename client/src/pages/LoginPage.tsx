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
} from "@mui/material";
import { useUserStore } from "../store/useUserStore";
import { loginLocal, loginWithGoogle } from "../services/userService";

export function LoginPage() {
  const navigate = useNavigate();
  const location=useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUserStore();
const getRedirectPath=()=>{
  const params=new URLSearchParams(location.search);
  const redirect=params.get("redirect");
return redirect ? decodeURIComponent(redirect) : "/home";
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await loginLocal(email, password);
      if (result) {
        const { user, token } = result;
        login(user, token);
        navigate(getRedirectPath());
      }
    } catch (err: any) {
      setError("Invalid email or password  || " + err.toString());
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
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
        bgcolor: "linear-gradient(to bottom right, #eff6ff, #f3e8ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
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

          <form onSubmit={handleSubmit}>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
            </CardContent>

            <CardActions sx={{ flexDirection: "column", gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ backgroundColor: "primary.main" ,color:"primary.contrastText"
              }}>
                Login
              </Button>

              <Divider sx={{ my: 1 }}>or</Divider>

              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login failed")}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
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
