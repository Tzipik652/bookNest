import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
import BookIcon from "@mui/icons-material/Book";
import { useUserStore } from "../store/useUserStore";
import { register } from "../services/userService";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUserStore();

  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    return redirect ? decodeURIComponent(redirect) : "/home";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      const { user, token } = await register(email, password, name);
      login(user, token);
      navigate(getRedirectPath());
    } catch (err: any) {
      setError("Registration failed  || " + err.toString());
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

        <form onSubmit={handleSubmit}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Full Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
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
            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: "primary.main" ,color:"primary.contrastText"
              }}>
              Register
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

