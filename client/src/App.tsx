// client/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { BookDetailsPage } from "./pages/BookDetailsPage";
import { AddBookPage } from "./pages/AddBookPage";
import { EditBookPage } from "./pages/EditBookPage";
import { MyBooksPage } from "./pages/MyBooksPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { AIRecommendationsPage } from "./pages/AIRecommendationsPage";
import { useUserStore } from "./store/useUserStore";
function App() {
  const { user: currentUser } = useUserStore();
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              // currentUser ? <Navigate to="/home" replace /> : <LandingPage />
            <HomePage />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/home"
            element={
              // <ProtectedRoute>
                <HomePage />
              // </ProtectedRoute>
            }
          />

          <Route path="/book/:id" element={<BookDetailsPage />} />

          <Route
            path="/add-book"
            element={
              <ProtectedRoute>
                <AddBookPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-book/:id"
            element={
              <ProtectedRoute>
                <EditBookPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-books"
            element={
              <ProtectedRoute>
                <MyBooksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <AIRecommendationsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
