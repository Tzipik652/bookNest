import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../lib/storage';
import { BookOpen } from 'lucide-react';
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
} from '@mui/material';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);
    if (user) {
      navigate('/home');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>
          <CardHeader
            title={
              <Box textAlign="center">
                <BookOpen size={48} color="#1976d2" style={{ marginBottom: 8 }} />
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
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Demo Credentials:</strong>
                  <br />
                  Email: demo@booknest.com
                  <br />
                  Password: demo123
                </Typography>
              </Alert>

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

            <CardActions sx={{ flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" fullWidth size="large">
                Login
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Don’t have an account?{' '}
                <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
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
