import { Box, Button, Container, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const LandingComponent = () => {
      const navigate = useNavigate();
    
  return (
    <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: 12,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to BookNest
          </Typography>
          <Typography variant="h6" mb={4}>
            Discover, organize, and share your favorite books with AI-powered
            recommendations
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
              color="secondary"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate("/register")}
              sx={{
                borderColor: "white",
                color: "main.contrastText",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Register
            </Button>
          </Box>
        </Container>
      </Box>
  )
}

export default LandingComponent;