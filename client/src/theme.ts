import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { useAccessibilityStore } from "../src/store/accessibilityStore"; 

export const useDynamicTheme = () => {
  const {
    darkMode,
    highContrast,
    largeText,
    dyslexicFont,
    underlineLinks,
    reduceMotion,
  } = useAccessibilityStore();

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: highContrast ? "#000" : darkMode ? "#121212" : "#fff",
        paper: highContrast ? "#000" : darkMode ? "#1E1E1E" : "#fff",
      },
      text: {
        primary: highContrast ? "#fff" : darkMode ? "#fff" : "#000",
        secondary: highContrast ? "#fff" : darkMode ? "#dddddd" : "#333",
      },
      primary: {
        main: highContrast ? "#fff" : "#16A34A",
        dark: highContrast ? "#fff" : "#12803A",
        contrastText: highContrast ? "#000" : "#fff",
      },
    },
    typography: {
      fontSize: largeText ? 16 : 14,
      fontFamily: dyslexicFont ? "'OpenDyslexic', Arial, sans-serif" : "Roboto, Arial",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { transition: reduceMotion ? "none" : "background-color 0.2s ease" },
          a: {
            textDecoration: underlineLinks ? "underline" : "none",
            fontWeight: underlineLinks ? "bold" : "normal",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: highContrast ? "#000" : darkMode ? "#1E1E1E" : "#fff",
            color: highContrast || darkMode ? "#fff" : "#000",
            transition: reduceMotion ? "none" : "all 0.2s ease",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: highContrast ? "#000" : darkMode ? "#1E1E1E" : "#fff",
            color: highContrast || darkMode ? "#fff" : "#000",
            transition: reduceMotion ? "none" : "all 0.2s ease",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: highContrast ? "#000" : darkMode ? "#1A1A1A" : "#16A34A",
            transition: reduceMotion ? "none" : "all 0.2s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            color: highContrast || darkMode ? "#fff" : undefined,
            transition: reduceMotion ? "none" : "all 0.2s ease",
            borderColor: highContrast ? "#fff" : undefined,
          },
        },
      },
    },
  }), [darkMode, highContrast, largeText, dyslexicFont, underlineLinks, reduceMotion]);

  return theme;
};
