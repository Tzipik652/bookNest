import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  BookOpen,
  Heart,
  PlusCircle,
  LogOut,
  User,
  Home,
  Library,
  Sparkles,
  Shield,
  Menu,
  X,
} from "lucide-react";

import { useUserStore } from "../store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import { useAccessibilityStore } from "../store/accessibilityStore";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { logout, user } = useUserStore();
  const [open, setOpen] = useState(false);
  const { darkMode, highContrast } = useAccessibilityStore();
  const { t, i18n } = useTranslation(["navbar"]);
  const isRtl = i18n.dir() === "rtl";

  const handleLogout = () => {
    logout(queryClient);
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/home")
      return location.pathname === "/" || location.pathname.startsWith("/home");
    return location.pathname.startsWith(path);
  };

  const currentPath = location.pathname;
  const encodedPath = encodeURIComponent(currentPath);

  const getButtonClasses = (path: string) =>
    `gap-2 px-2 lg:px-3 transition-colors duration-200 ${
      isActive(path)
        ? "bg-green-600 text-white hover:bg-green-700"
        : `${
            highContrast
              ? "text-white hover:text-gray-400"
              : darkMode
              ? "text-white hover:text-gray-300"
              : "text-black hover:text-green-700 hover:bg-green-100"
          }`
    }`;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const navBgClass = highContrast
    ? "bg-black text-white"
    : darkMode
    ? "bg-gray-900 text-white"
    : "bg-white text-black";

  const drawerBgClass = highContrast
    ? "bg-black text-white"
    : darkMode
    ? "bg-gray-900 text-white"
    : "bg-white text-black";

  return (
    <nav className={`border-b sticky top-0 z-[100] ${navBgClass}`}>
      <div className="container px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-green-600" />
          <span className="text-2xl">BookNest</span>
        </Link>

        {/* Desktop Menu */}
        {/* <div className="hidden lg:flex items-center gap-6"> */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-4">
          {user ? (
            <>
              <Link to="/home">
                <Button
                  variant="ghost"
                  className={getButtonClasses("/home")}
                  aria-label={t("home")}
                >
                  <Home className="h-4 w-4" /> {t("home")}
                </Button>
              </Link>
              <Link to="/my-books">
                <Button
                  variant="ghost"
                  className={getButtonClasses("/my-books")}
                  aria-label={t("myBooks")}
                >
                  <Library className="h-4 w-4" /> {t("myBooks")}
                </Button>
              </Link>
              <Link to="/favorites">
                <Button
                  variant="ghost"
                  className={getButtonClasses("/favorites")}
                  aria-label={t("favorites")}
                >
                  <Heart className="h-4 w-4" /> {t("favorites")}
                </Button>
              </Link>
              <Link to="/add-book">
                <Button
                  variant="ghost"
                  className={getButtonClasses("/add-book")}
                  aria-label={t("addBook")}
                >
                  <PlusCircle className="h-4 w-4" /> {t("addBook")}
                </Button>
              </Link>

              <Link to="/recommendations">
                <Button
                  variant="ghost"
                  className={getButtonClasses("/recommendations")}
                  aria-label={t("aiRecommendations")}
                >
                  <Sparkles className="h-4 w-4" /> {t("aiRecommendations")}
                </Button>
              </Link>

              {user.role === "admin" && (
                <Link to="/admin-dashboard">
                  <Button
                    variant="ghost"
                    className={getButtonClasses("/admin-dashboard")}
                    aria-label={t("admin")}
                  >
                    <Shield className="h-4 w-4" />
                    {t("admin")}
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                  aria-label={t("logout")}
                >
                  <LogOut className="h-4 w-4" /> {t("logout")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to={`/login?redirect=${encodedPath}`}>
                <Button variant="ghost" aria-label={t("login")}>
                  {t("login")}
                </Button>
              </Link>
              <Link to={`/register?redirect=${encodedPath}`}>
                <Button aria-label={t("register")}>{t("register")}</Button>
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setOpen(true)}
          aria-label={t("menu")}
          dir={isRtl ? "rtl" : "ltr"}
          style={{ cursor: "pointer" }}
          title={t("menu")}
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`lg:hidden`} dir={isRtl ? "rtl" : "ltr"}>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/20 z-[100] transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setOpen(false)}
        ></div>

        {/* Drawer Panel */}
        <div
          className={`fixed top-0 h-full w-64 shadow-lg p-6 flex flex-col gap-4 transform transition-transform duration-300 ease-in-out z-[200] ${drawerBgClass} 
                    ${
                      isRtl
                        ? open
                          ? "left-0 translate-x-0"
                          : "left-0 -translate-x-full"
                        : open
                        ? "right-0 translate-x-0"
                        : "right-0 translate-x-full"
                    }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="mb-4 self-end"
            onClick={() => setOpen(false)}
            aria-label={t("close")}
          >
            <X className="w-6 h-6" />
          </button>

          {user ? (
            <>
              <Link to="/home" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${getButtonClasses(
                    "/home"
                  )}`}
                  aria-label={t("home")}
                >
                  <Home className="h-4 w-4" /> {t("home")}
                </Button>
              </Link>
              <Link to="/my-books" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${getButtonClasses(
                    "/my-books"
                  )}`}
                  aria-label={t("myBooks")}
                >
                  <Library className="h-4 w-4" /> {t("myBooks")}
                </Button>
              </Link>
              <Link to="/favorites" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${getButtonClasses(
                    "/favorites"
                  )}`}
                  aria-label={t("favorites")}
                >
                  <Heart className="h-4 w-4" /> {t("favorites")}
                </Button>
              </Link>
              <Link to="/add-book" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${getButtonClasses(
                    "/add-book"
                  )}`}
                  aria-label={t("addBook")}
                >
                  <PlusCircle className="h-4 w-4" /> {t("addBook")}
                </Button>
              </Link>
              <Link to="/recommendations" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${getButtonClasses(
                    "/recommendations"
                  )}`}
                  aria-label={t("aiRecommendations")}
                >
                  <Sparkles className="h-4 w-4" /> {t("aiRecommendations")}
                </Button>
              </Link>
              {user.role === "admin" && (
                <Link to="/admin-dashboard">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${getButtonClasses(
                      "/admin-dashboard"
                    )}`}
                    aria-label={t("admin")}
                  >
                    <Shield className="h-4 w-4" />
                    {t("admin")}
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start gap-2 mt-4"
                aria-label={t("logout")}
              >
                <LogOut className="h-4 w-4" /> {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Link
                to={`/login?redirect=${encodedPath}`}
                onClick={() => setOpen(false)}
              >
                <Button className="w-full" aria-label={t("login")}>
                  {t("login")}
                </Button>
              </Link>
              <Link
                to={`/register?redirect=${encodedPath}`}
                onClick={() => setOpen(false)}
              >
                <Button className="w-full" aria-label={t("register")}>
                  {t("register")}
                </Button>
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
