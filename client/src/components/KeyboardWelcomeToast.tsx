import { useEffect, useState } from 'react';
import { Alert, Snackbar, Button, Box, Typography, useTheme } from '@mui/material'; // 👈 ייבוא useTheme
import { Keyboard, X } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccessibilityStore } from '../store/accessibilityStore'; 

export function KeyboardWelcomeToast() {
  const { t } = useTranslation(['welcomeToast', 'common']);
  const commonDir = t('common:dir') as 'rtl' | 'ltr';
  const theme = useTheme();
  const { highContrast } = useAccessibilityStore();

  const [isOpen, setIsOpen] = useState(false);
  const STORAGE_KEY = 'keyboard-welcome-shown';

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);

    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleDismiss = () => {
    handleClose();
  };


  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={null}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ maxWidth: '600px' }}
    >
      <Alert
        severity="info"
        sx={{
          width: '100%',
          bgcolor: theme.palette.background.paper, 
          border: `2px solid ${highContrast ? theme.palette.text.primary : theme.palette.primary.main}`, 
          boxShadow: theme.shadows[8],
          
          '& .MuiAlert-icon': {
            color: theme.palette.primary.main 
          },
          direction: commonDir
        }}
        icon={<Keyboard size={24} />}
        action={
          <Button
            size="small"
            onClick={handleDismiss}
            sx={{
              minWidth: 'auto',
              p: 1,
              order: commonDir === 'rtl' ? -1 : 1,
              color: theme.palette.text.secondary
            }}
          >
            <X size={18} />
          </Button>
        }
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" mb={1} color="text.primary">
            {t('proTipTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Trans
              i18nKey="tipBody"
              ns="welcomeToast"
              components={{
                bold: <strong />
              }}
            />
          </Typography>
          <Box mt={1.5}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleClose}
              sx={{
                textTransform: 'none',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  bgcolor: theme.palette.primary.light
                }
              }}
            >
              {t('dismissButton')}
            </Button>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
}