import { useEffect, useState } from 'react';
import { Alert, Snackbar, Button, Box, Typography } from '@mui/material';
import { Keyboard, X } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

export function KeyboardWelcomeToast() {
  const { t } = useTranslation(['welcomeToast', 'common']);
  const commonDir = t('common:dir') as 'rtl' | 'ltr';

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
          bgcolor: 'white',
          border: '2px solid #16A34A',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          '& .MuiAlert-icon': {
            color: '#16A34A'
          },
          direction: commonDir// === 'rtl' ? 'right' : 'left'
        }}
        icon={<Keyboard size={24} />}
        action={
          <Button
            size="small"
            onClick={handleDismiss}
            sx={{
              minWidth: 'auto',
              p: 1,
              order: commonDir === 'rtl' ? -1 : 1
            }}
          >
            <X size={18} />
          </Button>
        }
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
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
                borderColor: '#16A34A',
                color: '#16A34A',
                '&:hover': {
                  borderColor: '#15803D',
                  bgcolor: 'rgba(22, 163, 74, 0.04)'
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