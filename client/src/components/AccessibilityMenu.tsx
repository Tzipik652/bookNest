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
import { useTranslation } from "react-i18next";

export default function AccessibilityMenu() {
  const { t } = useTranslation(["accessibility", "common"]);
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
  const commonDir = t('common:dir') as 'rtl' | 'ltr';
  return (
    <div dir={commonDir}>
      {/* Floating Accessibility Button */}
      <IconButton
        onClick={toggleMenu}
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 1300,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "&:hover": { bgcolor: "primary.dark" },
        }}
        aria-label={t("ariaLabel")}
      >
        <AccessibilityNewIcon />
      </IconButton>

      {/* Accessibility Drawer */}
      <Drawer anchor="right" open={menuOpen} onClose={toggleMenu}>
        <div style={{ width: 280, padding: "16px" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
           {t("menuTitle")}
          </Typography>

          <List>
            {/* Dark Mode */}
            <ListItem>
              <ListItemText primary={t("darkMode")} />
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </ListItem>

            {/* High Contrast */}
            <ListItem>
              <ListItemText primary={t("highContrast")} />
              <Switch checked={highContrast} onChange={toggleHighContrast} />
            </ListItem>

            {/* Large Text */}
            <ListItem>
              <ListItemText primary={t("largeText")} />
              <Switch checked={largeText} onChange={toggleLargeText} />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Reduce Motion */}
            <ListItem>
              <ListItemText primary={t("reduceMotion")} /> 
              <Switch checked={reduceMotion} onChange={toggleReduceMotion} />
            </ListItem>

            {/* Underline Links */}
            <ListItem>
              <ListItemText primary={t("underlineLinks")} /> 
              <Switch
                checked={underlineLinks}
                onChange={toggleUnderlineLinks}
              />
            </ListItem>

            {/* Dyslexic-Friendly Font */}
            <ListItem>
              <ListItemText primary={t("dyslexicFont")} /> 
              <Switch checked={dyslexicFont} onChange={toggleDyslexicFont} />
            </ListItem>

            {/* Screen Reader Mode */}
            <ListItem>
              <ListItemText primary={t("screenReader")} /> 
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
          },
          a: {
            textDecoration: underlineLinks ? "underline" : "none",
          },
        }}
      />
    </div>
  );
}
