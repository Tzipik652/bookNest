import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useKeyboardModeBodyClass } from '../hooks/useKeyboardMode';
import { Box, Typography } from '@mui/material';

export function NotFoundPage() {
  const isKeyboardMode = useKeyboardModeBodyClass();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const alignment = t('dir') === 'rtl' ? 'right' : 'left';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 4
      }}
      dir={t('dir')}
    >
      <Box sx={{ textAlign: 'center', maxWidth: '48rem' }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography 
            component="h1" 
            variant="h1" 
            sx={{ 
              fontSize: '10rem', 
              color: 'primary.main', 
              opacity: 0.3,
              fontWeight: 'bold',
            }}
          >
            404
          </Typography>
        </Box>

        {/* Icon */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Box 
            sx={{ 
              bgcolor: 'background.paper',
              p: 3, 
              borderRadius: '50%', 
              boxShadow: 3,
              color: 'primary.main' 
            }}
          >
            <BookOpen className="h-16 w-16" />
          </Box>
        </Box>

        {/* Message */}
        <Typography 
          component="h2" 
          variant="h4" 
          color="text.primary"
          sx={{ mb: 2, textAlign: alignment }}
        >
          {t('notFound.title')}
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 4, textAlign: alignment }}
        >
          {t('notFound.mainMessage')}
        </Typography>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
            aria-label={t('notFound.backButton')}
          >
            <ArrowLeft className="h-5 w-5" />
            {t('notFound.backButton')}
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2"
            aria-label={t('notFound.homeButton')}
          >
            <Home className="h-5 w-5" />
            {t('notFound.homeButton')}
          </Button>
        </div>

        {/* Additional Help Text */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 4, opacity: 0.7, textAlign: alignment }}
        >
          {t('notFound.footerMessage')}
        </Typography>
      </Box>
    </Box>
  );
}