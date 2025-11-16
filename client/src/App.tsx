// client/src/App.tsx
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { useUserStore } from "./store/useUserStore";

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

const RouteFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    sx={{ minHeight: "calc(100vh - 64px)", padding: 4 }}
  >
    <CircularProgress size={50} />
  </Box>
);

function App() {
  const { user: currentUser } = useUserStore();
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LazyHomePage />} />
            <Route path="/login" element={<LazyLoginPage />} />
            <Route path="/register" element={<LazyRegisterPage />} />

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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
