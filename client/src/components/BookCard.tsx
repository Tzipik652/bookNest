import { Heart } from 'lucide-react';
import { Book } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { isFavorite, toggleFavorite } from '../services/favoriteService';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useUserStore } from '../store/useUserStore';
interface BookCardProps {
  book: Book;
  onFavoriteChange?: () => void;
}

export function BookCard({ book, onFavoriteChange }: BookCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useUserStore();
  const [favorited, setFavorited] = useState(isFavorite(book._id));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If user is not logged in, redirect to login
    if (!currentUser) {
      const currentPath = location.pathname;
      const encodedPath = encodeURIComponent(currentPath);
      navigate(`/login?redirect=${encodedPath}`);
      return;
    }
    
    const newState = toggleFavorite(book._id);
    setFavorited(newState);
    onFavoriteChange?.();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div onClick={() => navigate(`/book/${book._id}`)}>
        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={book.img_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="line-clamp-2">{book.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="shrink-0"
            >
              <Heart 
                className={`h-5 w-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </Button>
          </div>
          <p className="text-gray-600 mb-2">{book.author}</p>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm mb-3">
            {book.category}
          </span>
          <p className="text-sm text-gray-700 line-clamp-3">{book.ai_summary}</p>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full"
          onClick={() => navigate(`/book/${book._id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
