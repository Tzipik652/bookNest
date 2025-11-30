import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['landing', 'common']); 
  const commonDir = t('common:dir') as 'rtl' | 'ltr';

  return (
    <Box dir={commonDir}
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
          {t('heading')}
        </Typography>

        <Typography variant="h6" mb={4}>
          {t('subheading')}
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
            {t('loginButton')}
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
            {t('registerButton')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingComponent;
