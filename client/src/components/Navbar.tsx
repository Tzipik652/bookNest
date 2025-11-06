import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../lib/storage';
import { Button } from './ui/button';
import { BookOpen, Heart, PlusCircle, LogOut, User, Home, Library, Sparkles } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl">BookNest</span>
          </Link>

          <div className="flex items-center gap-6">
            {currentUser ? (
              <>
                <Link to="/home">
                  <Button 
                    variant={isActive('/home') ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                
                <Link to="/my-books">
                  <Button 
                    variant={isActive('/my-books') ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Library className="h-4 w-4" />
                    My Books
                  </Button>
                </Link>
                
                <Link to="/favorites">
                  <Button 
                    variant={isActive('/favorites') ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Favorites
                  </Button>
                </Link>
                
                <Link to="/add-book">
                  <Button 
                    variant={isActive('/add-book') ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Book
                  </Button>
                </Link>
                
                <Link to="/recommendations">
                  <Button 
                    variant={isActive('/recommendations') ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Recommendations
                  </Button>
                </Link>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{currentUser.name}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
