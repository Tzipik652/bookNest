// client/src/App.tsx
import React, { Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CircularProgress, Box, GlobalStyles } from "@mui/material";
import { Toaster } from "sonner";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useUserStore } from "./store/useUserStore";
import { useAccessibilityStore } from "./store/accessibilityStore";
import AccessibilityMenu from "./components/AccessibilityMenu";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

// Lazy-loaded pages
const LazyLoginPage = React.lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const LazyRegisterPage = React.lazy(() =>
  import("./pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);
const LazyHomePage = React.lazy(() =>
  import("./pages/HomePage").then((module) => ({ default: module.HomePage }))
);
const LazyBookDetailsPage = React.lazy(() =>
  import("./pages/BookDetailsPage").then((module) => ({
    default: module.BookDetailsPage,
  }))
);
const LazyAddBookPage = React.lazy(() =>
  import("./pages/AddBookPage").then((module) => ({
    default: module.AddBookPage,
  }))
);
const LazyEditBookPage = React.lazy(() =>
  import("./pages/EditBookPage").then((module) => ({
    default: module.EditBookPage,
  }))
);
const LazyMyBooksPage = React.lazy(() =>
  import("./pages/MyBooksPage").then((module) => ({
    default: module.MyBooksPage,
  }))
);
const LazyFavoritesPage = React.lazy(() =>
  import("./pages/FavoritesPage").then((module) => ({
    default: module.FavoritesPage,
  }))
);
const LazyAIRecommendationsPage = React.lazy(() =>
  import("./pages/AIRecommendationsPage").then((module) => ({
    default: module.AIRecommendationsPage,
  }))
);
const LazyResetPasswordPage = React.lazy(() =>
  import("./pages/ResetPassword").then((module) => ({
    default: module.ResetPassword,
  }))
);
const LazyNotFoundPage = React.lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  }))
);

const LazyContactPage = React.lazy(() =>
  import("./pages/ContactPage").then((module) => ({
    default: module.ContactPage,
  }))
);

const LazyPrivacyPolicyPage = React.lazy(() =>
  import("./pages/PrivacyPolicyPage").then((module) => ({
    default: module.PrivacyPolicyPage,
  }))
);
const LazyForgotPasswordPage = React.lazy(() =>
  import("./pages/ForgotPassword").then((module) => ({
    default: module.ForgotPassword,
  }))
);

const LazyTermsOfServicePage = React.lazy(() =>
  import("./pages/TermsOfServicePage").then((module) => ({
    default: module.TermsOfServicePage,
  }))
);

const LazyFAQPage = React.lazy(() =>
  import("./pages/FAQPage").then((module) => ({
    default: module.FAQPage,
  }))
);

// Loader for lazy routes
const RouteFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    sx={{ minHeight: "calc(100vh - 64px)", p: 4 }}
  >
    <CircularProgress size={50} />
  </Box>
);

function App() {
  const { user: currentUser } = useUserStore();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  const {
    darkMode,
    highContrast,
    largeText,
    reduceMotion,
    underlineLinks,
    dyslexicFont,
    screenReader,
  } = useAccessibilityStore();

  // Auto ARIA-label for icon-only buttons
  document.querySelectorAll("button, [role='button'], a").forEach((el) => {
    const text = el.textContent;
    if (!el.getAttribute("aria-label") && text && text.trim() === "") {
      el.setAttribute("aria-label", "button");
    }
  });

  return (
    <div className="min-h-screen">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      <Navbar />
      <AccessibilityMenu />

      {/* Global Accessibility Overrides */}
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

      <Suspense fallback={<RouteFallback />}>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<LazyHomePage />} />
          <Route path="/login" element={<LazyLoginPage />} />
          <Route path="/register" element={<LazyRegisterPage />} />
          <Route path="/forgot-password" element={<LazyForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<LazyResetPasswordPage />}
          />

          <Route path="/home" element={<LazyHomePage />} />

          <Route path="/book/:id" element={<LazyBookDetailsPage />} />

          <Route
            path="/add-book"
            element={
              <ProtectedRoute>
                <LazyAddBookPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-book/:id"
            element={
              <ProtectedRoute>
                <LazyEditBookPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-books"
            element={
              <ProtectedRoute>
                <LazyMyBooksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <LazyFavoritesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <LazyAIRecommendationsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<LazyNotFoundPage />} />
          <Route path="/contact" element={<LazyContactPage />} />
          <Route path="/privacy-policy" element={<LazyPrivacyPolicyPage />} />
          <Route
            path="/terms-of-service"
            element={<LazyTermsOfServicePage />}
          />
          <Route path="/faq" element={<LazyFAQPage />} />
        </Routes>
      </Suspense>

      {/* Screen reader ARIA announcements */}
      {screenReader && (
        <div
          aria-live="assertive"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            margin: "-1px",
            padding: "0",
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            border: "0",
          }}
        >
          Screen reader mode enabled
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;
