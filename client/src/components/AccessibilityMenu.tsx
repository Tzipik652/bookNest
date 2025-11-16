import React from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  Typography,
  GlobalStyles,
} from "@mui/material";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import { useAccessibilityStore } from "../store/accessibilityStore";

export default function AccessibilityMenu() {
  const {
    menuOpen,
    toggleMenu,

    darkMode,
    toggleDarkMode,

    highContrast,
    toggleHighContrast,

    largeText,
    toggleLargeText,

    reduceMotion,
    toggleReduceMotion,

    underlineLinks,
    toggleUnderlineLinks,

    dyslexicFont,
    toggleDyslexicFont,

    screenReader,
    toggleScreenReader,
  } = useAccessibilityStore();

  return (
    <>
      {/* Floating Accessibility Button */}
      <IconButton
        onClick={toggleMenu}
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 1300,
          bgcolor: "primary.main",
          color: "#fff",
          "&:hover": { bgcolor: "primary.dark" },
        }}
        aria-label="Open Accessibility Menu"
      >
        <AccessibilityNewIcon />
      </IconButton>

      {/* Accessibility Drawer */}
      <Drawer anchor="right" open={menuOpen} onClose={toggleMenu}>
        <div style={{ width: 280, padding: "16px" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Accessibility Settings
          </Typography>

          <List>
            {/* Dark Mode */}
            <ListItem>
              <ListItemText primary="Dark Mode" />
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </ListItem>

            {/* High Contrast */}
            <ListItem>
              <ListItemText primary="High Contrast" />
              <Switch checked={highContrast} onChange={toggleHighContrast} />
            </ListItem>

            {/* Large Text */}
            <ListItem>
              <ListItemText primary="Large Text" />
              <Switch checked={largeText} onChange={toggleLargeText} />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Reduce Motion */}
            <ListItem>
              <ListItemText primary="Reduce Motion" />
              <Switch checked={reduceMotion} onChange={toggleReduceMotion} />
            </ListItem>

            {/* Underline Links */}
            <ListItem>
              <ListItemText primary="Underline Links" />
              <Switch
                checked={underlineLinks}
                onChange={toggleUnderlineLinks}
              />
            </ListItem>

            {/* Dyslexic-Friendly Font */}
            <ListItem>
              <ListItemText primary="Dyslexic-Friendly Font" />
              <Switch checked={dyslexicFont} onChange={toggleDyslexicFont} />
            </ListItem>

            {/* Screen Reader Mode */}
            <ListItem>
              <ListItemText primary="Screen Reader Mode" />
              <Switch checked={screenReader} onChange={toggleScreenReader} />
            </ListItem>
          </List>
        </div>
      </Drawer>

      {/* Global Accessibility Styles */}
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: darkMode
              ? "#121212"
              : highContrast
              ? "#000"
              : "#fff",
            color: darkMode || highContrast ? "#fff" : "#000",
            fontSize: largeText ? "1.2rem" : "1rem",
            transition: reduceMotion ? "none" : "all 0.3s ease",
            fontFamily: dyslexicFont ? "OpenDyslexic, Arial" : "inherit",
          },
          a: {
            textDecoration: underlineLinks ? "underline" : "none",
          },
        }}
      />
    </>
  );
}
