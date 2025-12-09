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
        default: highContrast ? "#000" : darkMode ? "#121212" : "#f9fafb",
        paper: highContrast ? "#000" : darkMode ? "#1E1E1E" : "#f9fafb",
      },
      text: {
        primary: highContrast ? "#fff" : darkMode ? "#fff" : "#000",
        secondary: highContrast ? "#fff" : darkMode ? "#dddddd" : "#333",
      },
      primary: {
        main: highContrast || darkMode ? "#fff" : "#16A34A",
        dark: highContrast || darkMode ? "#e0e0e0" : "#12803A",
        contrastText: highContrast || darkMode ? "#000" : "#fff",
      },
    },
    typography: {
      fontSize: largeText ? 16 : 14,
       fontFamily: dyslexicFont
    ? '"OpenDyslexic", sans-serif'
    : 'Rubik, sans-serif',
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
      MuiAlert: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            background:
              ownerState.severity === "info"
                ? highContrast
                  ? "#000"
                  : darkMode
                  ? "#1E1E1E"
                  : "#dffdd7"
                : undefined,
            color: highContrast || darkMode ? "#fff" : "#000",
            border: highContrast ? "1px solid #fff" : undefined,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: highContrast ? "#000" : darkMode ? "#1E1E1E" : "#f9fafb",
            color: highContrast || darkMode ? "#fff" : "#000",
            transition: reduceMotion ? "none" : "all 0.2s ease",
            border: highContrast ? "1px solid #fff" : "none", 
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: highContrast ? "#000" : darkMode ? "#1E1E1E" : "#f9fafb",
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
            borderBottom: highContrast ? "1px solid #fff" : "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {            
            transition: reduceMotion ? "none" : "all 0.2s ease",
            borderColor: highContrast ? "#fff" : undefined,
            
            "&.MuiButton-outlined": {
               borderColor: highContrast || darkMode ? "#fff" : undefined,
               color: highContrast || darkMode ? "#fff" : undefined,
            },
            "&.MuiButton-text": {
               color: highContrast || darkMode ? "#fff" : undefined,
            }
          },
        },
      },
    },
  }), [darkMode, highContrast, largeText, dyslexicFont, underlineLinks, reduceMotion]);

  return theme;
};