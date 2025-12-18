import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  getBooks,
  getBooksByCategory,
  searchBooks,
} from "../services/bookService";
import { getCategories } from "../services/categoryService";

import { BookCard } from "../components/BookCard";
import BookGridSkeleton from "../components/BookGridSkeleton";

import { Book, Category, BookWithFavorite } from "../types";
import { useUserStore } from "../store/useUserStore";
import { useFavoriteBooks } from "../hooks/useFavorites";
import { useTranslation } from "react-i18next";
import { useKeyboardGridNavigation } from "../hooks/useKeyboardGridNavigation";

const BOOKS_PER_PAGE = 20;

export function HomePage() {
  const { t } = useTranslation(["home", "common"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const debounceRef = useRef<number|null>(null);

  const discoverRef = useRef<HTMLHeadingElement | null>(null);
  const { favoriteBooksQuery } = useFavoriteBooks();

  /** Fetch categories */
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: booksResult, isLoading } = useQuery({
    queryKey: ["books", selectedCategory, debouncedSearchQuery, currentPage],
    queryFn: () => {
      if (debouncedSearchQuery) {
        const categoryObj = categories.find((c) => c.name === selectedCategory);
        const categoryId = categoryObj ? categoryObj.id : undefined;
        return searchBooks(
          debouncedSearchQuery,
          currentPage,
          BOOKS_PER_PAGE,
          categoryId
        );
      }
      if (selectedCategory === "All") {
        return getBooks({ page: currentPage, limit: BOOKS_PER_PAGE });
      }
      return getBooksByCategory(selectedCategory, currentPage, BOOKS_PER_PAGE);
    },
    staleTime: 2 * 60 * 1000,
  });

  
  const displayedBooks: BookWithFavorite[] = booksResult?.books || [];
  const totalPages = booksResult?.totalPages || 1;

  const {
    gridRef,
    focusedIndex,
    setFocusedIndex,
    registerItem,
    handleItemKeyDown,
  } = useKeyboardGridNavigation<Book>({
    items: displayedBooks,
    getId: (b) => b._id,
    onEnter: (b) => navigate(`/book/${b._id}`),
    onNextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    onPrevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  });

  /** Merge favorite status into books cache */
  useEffect(() => {
    if (!displayedBooks.length || !favoriteBooksQuery.data) return;
    const favoriteIds = new Set(favoriteBooksQuery.data.map((b) => b._id));

    displayedBooks.forEach((book) => {
      queryClient.setQueryData<BookWithFavorite>(
        ["book", book._id],
        (existing) => ({
          ...existing,
          ...book,
          favorites_count:
            existing?.favorites_count ?? book.favorites_count ?? 0,
          isFavorited: existing?.isFavorited ?? favoriteIds.has(book._id),
        })
      );
    });
  }, [displayedBooks, favoriteBooksQuery.data, queryClient]);

  /** Close category select on scroll */
  useEffect(() => {
    if (!isCategorySelectOpen) return;
    const handleScroll = () => setIsCategorySelectOpen(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCategorySelectOpen]);

  /** Global keyboard shortcuts */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      if (!key) return;

      // Focus search
      if (e.ctrlKey && key === "k") {
        e.preventDefault();
        document.getElementById("search-books")?.focus();
        return;
      }

      // Focus category select
      if (key === "c") {
        e.preventDefault();
        document.getElementById("category-select")?.focus();
        return;
      }

      // Clear search
      if (e.key === "Escape") {
        setSearchQuery("");
        return;
      }

      // Pagination
      if (e.ctrlKey && key === "n") {
        e.preventDefault();
        setCurrentPage((p) => Math.min(p + 1, totalPages));
        return;
      }
      if (e.ctrlKey && key === "p") {
        e.preventDefault();
        setCurrentPage((p) => Math.max(p - 1, 1));
        return;
      }

      // Grid navigation
      if (
        [
          "ArrowRight",
          "ArrowLeft",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
          "Enter",
          " ",
        ].includes(e.key)
      ) {
        handleItemKeyDown(e as any, focusedIndex);
      }

      // Focus search with '/'
      if (e.key === "/" || e.code === "Slash") {
        e.preventDefault();
        document.getElementById("search-books")?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [focusedIndex, handleItemKeyDown, totalPages]);

  /** Scroll behavior on load or data change */
  useEffect(() => {
    if (isLoading) {
      if (firstLoad) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setFirstLoad(false);
      } else if (discoverRef.current) {
        discoverRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [isLoading]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (value !== currentPage) setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", paddingBottom: 8 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={2}
          py={2}
          ref={discoverRef}
          className="notranslate"
        >
          {t("home:page_title")}
        </Typography>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 6, flexWrap: "wrap" }}>
          <TextField
            className="notranslate"
            id="search-books"
            aria-label={t("home:search_placeholder")}
            value={searchQuery}
            placeholder={t("home:search_placeholder")}
            onChange={
              (e) => {
                const value = e.target.value;
                setSearchQuery(value)
                clearTimeout(debounceRef.current || undefined);
                debounceRef.current = window.setTimeout(()=>{
                  console.log(e.target.value)
                  setDebouncedSearchQuery(value)
                },300)
              }
            }
            sx={{ flex: 1, minWidth: 250, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel className="notranslate">
              {t("home:category_label")}
            </InputLabel>
            <Select
              id="category-select"
              aria-label={t("home:category_label")}
              value={selectedCategory || ""}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              open={isCategorySelectOpen}
              onOpen={() => setIsCategorySelectOpen(true)}
              onClose={() => setIsCategorySelectOpen(false)}
              MenuProps={{ disableScrollLock: true }}
              label={t("home:category_label")}
            >
              <MenuItem value="All">{t(`category:All`)}</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {t(`category:${cat.name.replace(/\s+/g, "")}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Books Grid */}
        {isLoading ? (
          <BookGridSkeleton count={BOOKS_PER_PAGE} />
        ) : displayedBooks.length > 0 ? (
          <Box
            ref={gridRef}
            display="flex"
            flexWrap="wrap"
            gap={3}
            justifyContent="flex-start"
          >
            {displayedBooks.map((book, index) => (
              <Box
                key={book._id}
                tabIndex={0}
                ref={(el: HTMLElement | null) => registerItem(index, el)}
                onFocus={() => setFocusedIndex(index)}
                onKeyDown={(e) => handleItemKeyDown(e, index)}
                sx={{
                  flex: "1 1 calc(25% - 24px)",
                  minWidth: 250,
                  maxWidth: 300,
                  outline: "none",
                  "&:focus": {
                    boxShadow: "0 0 0 3px #16A34A",
                    borderRadius: 2,
                    zIndex: 10,
                  },
                }}
                aria-label={`${book.title} by ${book.author}`}
              >
                <BookCard book={book} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={12}>
            <Typography color="text.secondary" className="notranslate">
              {t("home:no_books_found")}
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              size="large"
              disabled={isLoading}
              dir="ltr"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
