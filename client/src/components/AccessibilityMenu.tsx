import React, { useState } from 'react';
import { Drawer, IconButton, Typography, Switch, FormControlLabel, GlobalStyles } from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import { useAccessibilityStore } from '../store/accessibilityStore';

export default function AccessibilityMenu() {
  const { darkMode, highContrast, largeText, toggleDarkMode, toggleHighContrast, toggleLargeText } =
    useAccessibilityStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 1300,
          bgcolor: 'primary.main',
          color: '#fff',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
        aria-label="Open Accessibility Menu"
      >
        <AccessibilityNewIcon />
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} aria-label="Accessibility Menu">
        <div style={{ width: 250, padding: 16 }}>
          <Typography variant="h6" gutterBottom>
            Accessibility
          </Typography>

          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} color="primary" />}
            label="Dark Mode"
          />
          <FormControlLabel
            control={<Switch checked={highContrast} onChange={toggleHighContrast} color="primary" />}
            label="High Contrast"
          />
          <FormControlLabel
            control={<Switch checked={largeText} onChange={toggleLargeText} color="primary" />}
            label="Large Text"
          />
        </div>
      </Drawer>

      <GlobalStyles
        styles={{
          body: {
            backgroundColor: darkMode ? '#121212' : highContrast ? '#000' : '#fff',
            color: darkMode ? '#fff' : highContrast ? '#fff' : '#000',
            fontSize: largeText ? '1.2rem' : '1rem',
            transition: 'all 0.3s ease',
          },
        }}
      />
    </>
  );
}
