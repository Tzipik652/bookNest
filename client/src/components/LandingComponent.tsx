import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom';

const LandingComponent = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundImage: `url("https://images.unsplash.com/photo-1662582631700-676a217d511f?auto=format&fit=crop&w=1600&q=80")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        color: "white",
        py: 35,
        textAlign: "center",

        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }
      }}
    >
      <Container
        maxWidth="md"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to BookNest
        </Typography>

        <Typography variant="h6" mb={4}>
          Discover, organize, and share your favorite books with AI-powered recommendations
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
            aria-label='click to login'
          >
            Login
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate("/register")}
            sx={{
              borderColor: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
            aria-label='click to register'
          >
            Register
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingComponent;
