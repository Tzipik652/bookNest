import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../lib/storage';
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
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const user = register(email, password, name);
    if (user) {
      navigate('/home');
    } else {
      setError('Email already exists');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #eff6ff, #ede9fe)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, boxShadow: 3 }}>
        <CardHeader
          title={
            <Box textAlign="center">
              <BookIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
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
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 2, p: 2 }}
          >
            <Button type="submit" variant="contained" fullWidth>
              Register
            </Button>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
                Login here
              </Link>
            </Typography>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
}
