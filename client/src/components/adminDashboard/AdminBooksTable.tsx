import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  Pagination,
  Box,
} from "@mui/material";
import { BookOpen, Edit, Trash2, Search as SearchIcon } from "lucide-react";
import { CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Book } from "../../types";
import { deleteBook, getBooks, searchBooks } from "../../services/bookService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAccessibilityStore } from "../../store/accessibilityStore";



export const AdminBooksTable = () => {
  const { t } = useTranslation(["adminDashboard", "common"]);
  const booksTableTexts = t("dashboard.booksTable", {
    returnObjects: true,
  }) as Record<string, string>;

  const theme = useTheme();
  const { highContrast } = useAccessibilityStore();
  const navigate = useNavigate();

  // --- States ---
  const [currentBooks, setCurrentBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const prevPageRef = useRef(page);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 1. Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // 2. Fetch Data Function using your Service
  const fetchBooksData = async () => {
    setIsLoading(true);
    try {
      let response;

      if (debouncedSearch) {
        response = await searchBooks(debouncedSearch, page, ITEMS_PER_PAGE);
      } else {
        response = await getBooks({ page, limit: ITEMS_PER_PAGE });
      }

      if (response) {
        const booksList = response.books || response.docs || [];
        const pagesTotal = response.totalPages || 1;

        setCurrentBooks(booksList);
        setTotalPages(pagesTotal);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error(t("common:errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Trigger Fetch on Page or Search Change
  useEffect(() => {
    fetchBooksData();
    if (prevPageRef.current !== page) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const tableTop = document.getElementById("table-top-anchor");
        if (tableTop) {
          tableTop.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm(booksTableTexts.deleteConfirm)) {
      try {
        await deleteBook(bookId);
        toast.success(booksTableTexts.deleteSuccess);

        fetchBooksData();

      } catch (error) {
        toast.error(booksTableTexts.deleteFailed);
      }
    }
  };

  const handleEditBook = (bookId: string) => {
    navigate(`/edit-book/${bookId}`, { state: { from: "/admin-dashboard" } });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // --- Styles (Same as before) ---
  const textColorStyle = highContrast
    ? { color: theme.palette.text.primary }
    : { color: theme.palette.text.secondary };

  const lightTextColorStyle = highContrast
    ? { color: theme.palette.text.primary }
    : {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[700]
          : theme.palette.text.secondary,
    };

  const headerBgStyle = {
    backgroundColor: highContrast
      ? theme.palette.background.default
      : alpha(
        theme.palette.divider,
        theme.palette.mode === "dark" ? 0.05 : 0.1
      ),
    borderBottom: highContrast
      ? `2px solid ${theme.palette.text.primary}`
      : `1px solid ${theme.palette.divider}`,
  };

  const hoverBgStyle = {
    backgroundColor: highContrast
      ? alpha(theme.palette.text.primary, 0.15)
      : alpha(theme.palette.action.hover, 0.1),
    transition: "background-color 0.15s ease",
  };

  const categoryChipStyle = {
    backgroundColor: highContrast
      ? "transparent"
      : alpha(
        theme.palette.success.main,
        theme.palette.mode === "dark" ? 0.15 : 0.05
      ),
    color: highContrast
      ? theme.palette.text.primary
      : theme.palette.success.main,
    border: highContrast
      ? `1px solid ${theme.palette.text.primary}`
      : `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  };

  const getActionButtonStyle = (
    colorKey: "primary" | "success" | "error" | "info"
  ) => {
    const mainColor = theme.palette[colorKey].main;
    const hoverColor = highContrast ? theme.palette.text.primary : mainColor;

    return {
      color: hoverColor,
      "&:hover": {
        color: hoverColor,
        backgroundColor: highContrast
          ? alpha(theme.palette.text.primary, 0.15)
          : alpha(mainColor, 0.1),
      },
    };
  };

  const viewButtonStyle = getActionButtonStyle("info");
  const editButtonStyle = getActionButtonStyle("success");
  const deleteButtonStyle = getActionButtonStyle("error");

  return (
    <div dir={t("common:dir")}>
      <Card
        id="table-top-anchor"
        className="mb-8 shadow-sm"
        style={
          highContrast
            ? { border: `2px solid ${theme.palette.text.primary}` }
            : { border: "0" }
        }
      >
        <CardHeader
          title={
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
                gap: 2
              }}
            >
              <Box>
                {/* <CardTitle style={{ color: theme.palette.text.primary }}>
                  {booksTableTexts.cardTitle}
                </CardTitle> */}
                <CardDescription style={{ color: theme.palette.text.secondary }}>
                  {booksTableTexts.cardDescription}
                </CardDescription>
              </Box>

              {/* --- Search Bar --- */}
              <TextField
                placeholder={t("common:search", "Search...")}
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: { xs: "100%", md: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={20} className="text-gray-500" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          }
        />

       <CardContent>
          {/* --- Desktop Table --- */}
          {/* הסתרת הטבלה כולה אם אין תוצאות ואין טעינה, כדי למנוע טבלה ריקה */}
          {(isLoading || currentBooks.length > 0) && (
            <div
              className="hidden md:block rounded-md border"
              style={
                highContrast
                  ? { border: `2px solid ${theme.palette.text.primary}` }
                  : { borderColor: theme.palette.divider }
              }
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={headerBgStyle}>
                    <th className="text-start py-3 px-4 font-medium" style={textColorStyle}>
                      {booksTableTexts.headerTitle}
                    </th>
                    <th className="text-start py-3 px-4 font-medium" style={textColorStyle}>
                      {booksTableTexts.headerAuthor}
                    </th>
                    <th className="text-start py-3 px-4 font-medium" style={textColorStyle}>
                      {booksTableTexts.headerCategory}
                    </th>
                    <th className="text-start py-3 px-4 font-medium" style={textColorStyle}>
                      {booksTableTexts.headerUploader}
                    </th>
                    <th className="text-start py-3 px-4 font-medium" style={textColorStyle}>
                      {booksTableTexts.headerDate}
                    </th>
                    <th className="text-right py-3 px-4 font-medium" style={textColorStyle}>
                      {booksTableTexts.headerActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                          <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </td>
                        </tr>
                      ))
                    : currentBooks.map((book) => (
                        <tr
                          key={book._id}
                          style={{
                            borderBottom: highContrast
                              ? `1px solid ${theme.palette.text.primary}`
                              : `1px solid ${theme.palette.divider}`,
                            cursor: "pointer",
                            ...(!highContrast && { "&:hover": hoverBgStyle }),
                          }}
                          onMouseEnter={(e) => {
                            if (!highContrast) e.currentTarget.style.backgroundColor = hoverBgStyle.backgroundColor;
                          }}
                          onMouseLeave={(e) => {
                            if (!highContrast) e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <td className="py-3 px-4 font-medium" style={{ color: theme.palette.text.primary }}>
                            {book.title}
                          </td>
                          <td className="py-3 px-4" style={lightTextColorStyle}>
                            {book.author}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0"
                              style={categoryChipStyle}
                            >
                              {t(`category:${book.category.replace(/\s+/g, "")}`)}
                            </span>
                          </td>
                          <td className="py-3 px-4" style={lightTextColorStyle}>
                            {book.user?.name || booksTableTexts.unknownUser}
                          </td>
                          <td className="py-3 px-4" style={lightTextColorStyle}>
                            {new Date(book.date_created).toLocaleDateString(t("common:locale"))}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/book/${book._id}`)}
                                style={viewButtonStyle}
                              >
                                <BookOpen className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditBook(book._id)}
                                style={editButtonStyle}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteBook(book._id)}
                                style={deleteButtonStyle}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- Small Screen Cards --- */}
          {/* מציגים רק אם יש טעינה או תוצאות */}
          {(isLoading || currentBooks.length > 0) && (
            <div className="md:hidden space-y-4">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                currentBooks.map((book) => (
                  <div
                    key={book._id}
                    className="border rounded-lg p-3"
                    style={{ borderColor: theme.palette.divider }}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-bold">{book.title}</h3>
                      <span style={categoryChipStyle} className="px-2 rounded-full text-xs flex items-center">
                        {t(`category:${book.category}`)}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditBook(book._id)}><Edit size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBook(book._id)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* --- No Results State (Unified) --- */}
          {/* זה יופיע גם במובייל וגם בדסקטופ */}
          {!isLoading && currentBooks.length === 0 && (
            <Box 
              sx={{ 
                textAlign: "center", 
                py: 8, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2,
                color: theme.palette.text.secondary
              }}
            >
              <SearchIcon size={48} style={{ opacity: 0.2 }} />
              <Box>
                <Box component="p" sx={{ fontWeight: 500, fontSize: '1.1rem', color: theme.palette.text.primary }}>
                 {t('common:noSearchResults') || "No book found matching your search."}
                </Box>
              </Box>
            </Box>
          )}

          {/* --- Pagination Controls --- */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
                disabled={isLoading}
                dir="ltr"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: theme.palette.text.primary
                  }
                }}
              />
            </Box>
          )}

        </CardContent>
      </Card>
    </div>
  );
};