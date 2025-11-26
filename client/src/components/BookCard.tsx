import React from "react";
import { Heart } from "lucide-react";
import { Book } from "../types";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useUserStore } from "../store/useUserStore";
import { useFavoriteBooks } from "../hooks/useFavorites";
import { useDynamicTheme } from "../theme";
import { useQueryClient } from "@tanstack/react-query";
import { BookWithFavorite } from "../types/index";
import { useTranslation } from "react-i18next";
interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { t } = useTranslation(["bookCard", "common"]);
  const theme = useDynamicTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useUserStore();
  const commonDir = t('common:dir') as 'rtl' | 'ltr';

  const queryClient = useQueryClient();
  const { toggleMutation } = useFavoriteBooks();

  const bookFromCache = queryClient.getQueryData<BookWithFavorite>([
    "book",
    book._id,
  ]);

  const displayedBook: BookWithFavorite = bookFromCache || {
    ...book,
    isFavorited: false,
    favorites_count: book.favorites_count ?? 0,
  };
  const isLoading = toggleMutation.isPending;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUser) {
      const encodedPath = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${encodedPath}`);
      return;
    }

    toggleMutation.mutate(book._id);
  };

  return (
    <Card
    dir={commonDir}
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      style={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <div onClick={() => navigate(`/book/${book._id}`)}>
        <div
          className="w-full h-72 sm:h-56 xs:h-40 overflow-hidden bg-gray-100"
        >
          <ImageWithFallback
            src={book.img_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <CardContent className="p-4 pb-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="line-clamp-2 leading-tight">{book.title}</h3>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">
                {displayedBook.favorites_count}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                className="shrink-0"
                disabled={isLoading}
                aria-label={t('bookCard:heartAriaLabel')}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${displayedBook.isFavorited
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                    } ${isLoading ? "opacity-50" : ""}`}
                  style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                />
              </Button>
            </div>
          </div>
          <p
            className="text-gray-600 mb-2"
            style={{ color: theme.palette.text.secondary }}
          >
            {book.author}
          </p>
          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm mb-3">
            {book.category}
          </span>
          <p
            className="text-sm text-gray-700 line-clamp-3 overflow-hidden"
            style={{
              color: theme.palette.text.secondary,
              lineHeight: "1.2rem",
              height: "3.6rem",
            }}
          >
            {book.ai_summary}
          </p>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => navigate(`/book/${book._id}`)}
        >
          {t('viewDetails')}
        </Button>
      </CardFooter>
    </Card>
  );
}
