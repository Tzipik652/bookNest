import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Button } from './ui/button';
import { 
  BookOpen, Heart, PlusCircle, LogOut, User, Home, Library, Sparkles, Menu, X 
} from "lucide-react";
import { useUserStore } from '../store/useUserStore';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useUserStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const currentPath = location.pathname;
  const encodedPath = encodeURIComponent(currentPath);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <nav className="border-b bg-white sticky top-0 z-[100]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-2xl">BookNest</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/home">
                <Button variant={isActive('/home') ? 'default' : 'ghost'} className="gap-2">
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>

              <Link to="/my-books">
                <Button variant={isActive('/my-books') ? 'default' : 'ghost'} className="gap-2">
                  <Library className="h-4 w-4" /> My Books
                </Button>
              </Link>

              <Link to="/favorites">
                <Button variant={isActive('/favorites') ? 'default' : 'ghost'} className="gap-2">
                  <Heart className="h-4 w-4" /> Favorites
                </Button>
              </Link>

              <Link to="/add-book">
                <Button variant={isActive('/add-book') ? 'default' : 'ghost'} className="gap-2">
                  <PlusCircle className="h-4 w-4" /> Add Book
                </Button>
              </Link>

              <Link to="/recommendations">
                <Button variant={isActive('/recommendations') ? 'default' : 'ghost'} className="gap-2">
                  <Sparkles className="h-4 w-4" /> AI Recommendations
                </Button>
              </Link>

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

        {/* Mobile Hamburger */}
        <button className="lg:hidden" onClick={() => setOpen(true)}>
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Drawer + Overlay */}
      <div className={`lg:hidden`}>
        {/* Overlay עם fade */}
        <div
          className={`fixed inset-0 bg-black/20 z-[100] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setOpen(false)}
        ></div>

        {/* Drawer */}
        <div
          className={`fixed right-0 top-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col gap-4
                      transform transition-transform duration-300 ease-in-out
                      z-[200] ${open ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* סגירה */}
          <button className="mb-4 self-end" onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>

          {user ? (
            <>
              <Link to="/home" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>

              <Link to="/my-books" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Library className="h-4 w-4" /> My Books
                </Button>
              </Link>

              <Link to="/favorites" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Heart className="h-4 w-4" /> Favorites
                </Button>
              </Link>

              <Link to="/add-book" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <PlusCircle className="h-4 w-4" /> Add Book
                </Button>
              </Link>

              <Link to="/recommendations" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Sparkles className="h-4 w-4" /> AI Recommendations
                </Button>
              </Link>

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
