// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import AccessibilityMenu from "./components/AccessibilityMenu";
import { useDynamicTheme } from "./theme";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID!;

// Wrapper component כדי להשתמש ב-hook
function Root() {
  const theme = useDynamicTheme(); // ✅ hook חוקי כאן
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AccessibilityMenu />
      <App />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Root />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
