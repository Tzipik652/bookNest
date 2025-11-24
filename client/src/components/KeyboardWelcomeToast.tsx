import { useEffect, useState } from 'react';
import { Alert, Snackbar, Button, Box, Typography } from '@mui/material';
import { Keyboard, X } from 'lucide-react';

export function KeyboardWelcomeToast() {
  const [isOpen, setIsOpen] = useState(false);
  const STORAGE_KEY = 'keyboard-welcome-shown';

  useEffect(() => {
    // בדיקה אם המשתמש כבר ראה את ההודעה
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);
    
    if (!hasSeenWelcome) {
      // הצגת ההודעה אחרי 2 שניות
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
          }
        }}
        icon={<Keyboard size={24} />}
        action={
          <Button
            size="small"
            onClick={handleDismiss}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <X size={18} />
          </Button>
        }
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            💡 Pro Tip: Navigate with Keyboard!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Press <strong>?</strong> anytime to see all keyboard shortcuts.
            Try <strong>/</strong> to search or <strong>arrow keys</strong> to navigate between books!
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
              Got it!
            </Button>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
}