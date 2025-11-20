import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Button } from './ui/button';
import { 
  BookOpen, Heart, PlusCircle, LogOut, User, Home, Library, Sparkles,Shield, Menu, X 
} from "lucide-react";
import { useUserStore } from '../store/useUserStore';
import { useQueryClient } from '@tanstack/react-query';
import { useAccessibilityStore } from '../store/accessibilityStore';


export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { logout, user } = useUserStore();
  const [open, setOpen] = useState(false);
  const { darkMode, highContrast } = useAccessibilityStore();

  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: ['favoriteBooks'] });
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/' || location.pathname.startsWith('/home');
    return location.pathname.startsWith(path);
  };

  const currentPath = location.pathname;
  const encodedPath = encodeURIComponent(currentPath);

  const getButtonClasses = (path: string) =>
    `gap-2 transition-colors duration-200 ${
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
    document.body.style.overflow = open ? 'hidden' : '';
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
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-green-600" />
          <span className="text-2xl">BookNest</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/home">
                <Button variant="ghost" className={getButtonClasses("/home")}>
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>
              <Link to="/my-books">
                <Button variant="ghost" className={getButtonClasses("/my-books")}>
                  <Library className="h-4 w-4" /> My Books
                </Button>
              </Link>
              <Link to="/favorites">
                <Button variant="ghost" className={getButtonClasses("/favorites")}>
                  <Heart className="h-4 w-4" /> Favorites
                </Button>
              </Link>
              <Link to="/add-book">
                <Button variant="ghost" className={getButtonClasses("/add-book")}>
                  <PlusCircle className="h-4 w-4" /> Add Book
                </Button>
              </Link>

              <Link to="/recommendations">
                <Button variant="ghost" className={getButtonClasses("/recommendations")}>
                  <Sparkles className="h-4 w-4" /> AI Recommendations
                </Button>
              </Link>
               {user.role==="admin" && (
                  <Link to="/admin-dashboard">
                    <Button variant="ghost" className={getButtonClasses("/admin-dashboard")}>
                      <Shield className="h-4 w-4"  />
                      Admin
                    </Button>
                  </Link>
                )}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to={`/login?redirect=${encodedPath}`}>
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to={`/register?redirect=${encodedPath}`}>
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden" onClick={() => setOpen(true)}>
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`lg:hidden`}>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/20 z-[100] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setOpen(false)}
        ></div>

        {/* Drawer Panel */}
        <div
          className={`fixed right-0 top-0 h-full w-64 shadow-lg p-6 flex flex-col gap-4 transform transition-transform duration-300 ease-in-out z-[200] ${
            open ? drawerBgClass + " translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="mb-4 self-end" onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>

          {user ? (
            <>
              <Link to="/home" onClick={() => setOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start ${getButtonClasses("/home")}`}>
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>
              <Link to="/my-books" onClick={() => setOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start ${getButtonClasses("/my-books")}`}>
                  <Library className="h-4 w-4" /> My Books
                </Button>
              </Link>
              <Link to="/favorites" onClick={() => setOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start ${getButtonClasses("/favorites")}`}>
                  <Heart className="h-4 w-4" /> Favorites
                </Button>
              </Link>
              <Link to="/add-book" onClick={() => setOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start ${getButtonClasses("/add-book")}`}>
                  <PlusCircle className="h-4 w-4" /> Add Book
                </Button>
              </Link>
              <Link to="/recommendations" onClick={() => setOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start ${getButtonClasses("/recommendations")}`}>
                  <Sparkles className="h-4 w-4" /> AI Recommendations
                </Button>
              </Link>
              {user.role==="admin" && (
                  <Link to="/admin-dashboard">
                    <Button variant="ghost" className={`w-full justify-start ${getButtonClasses("/admin-dashboard")}`}>
                      <Shield className="h-4 w-4"  />
                      Admin
                    </Button>
                  </Link>
                )}
              <Button variant="outline" onClick={handleLogout} className="w-full justify-start gap-2 mt-4">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to={`/login?redirect=${encodedPath}`} onClick={() => setOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
              <Link to={`/register?redirect=${encodedPath}`} onClick={() => setOpen(false)}>
                <Button className="w-full">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
