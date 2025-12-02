import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, Skeleton, useTheme, alpha } from "@mui/material"; 
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Book } from "../../types";
import { deleteBook } from "../../services/bookService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAccessibilityStore } from "../../store/accessibilityStore"; 

interface AdminBooksTableProps {
  books: Book[];
  isLoading?: boolean;
  userMap: Record<string, string>;
}

export const AdminBooksTable = ({
  books,
  isLoading,
  userMap,
}: AdminBooksTableProps) => {
  const { t } = useTranslation(["adminDashboard", "common"]);
  const booksTableTexts = t('dashboard.booksTable', { returnObjects: true }) as Record<string, string>;
  
  const theme = useTheme();
  const { highContrast } = useAccessibilityStore(); 

  const [currentBooks, setCurrentBooks] = useState<Book[]>(books); 
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentBooks(books);
  }, [books]);

  const handleDeleteBook = async (bookId: string) => {
    if (
      window.confirm(
        booksTableTexts.deleteConfirm
      )
    ) {
      try {
        await deleteBook(bookId);
        setCurrentBooks((prevBooks) =>
          prevBooks.filter((book) => book._id !== bookId)
        );
        toast.success(booksTableTexts.deleteSuccess);
      } catch (error) {
        toast.error(booksTableTexts.deleteFailed);
      }
    }
  };

  const handleEditBook = (bookId: string) => {
    navigate(`/edit-book/${bookId}`, { state: { from: "/admin-dashboard" } });
  };
  
  // --- הגדרות עיצוב דינמיות ---
  
  // צבעי הטקסט הראשיים בטבלה (כותרות עמודות)
  const textColorStyle = highContrast ? { color: theme.palette.text.primary } : { color: theme.palette.text.secondary };

  // צבע הטקסט הבהיר (שם מחבר, תאריך, אפור קלאסי)
  const lightTextColorStyle = highContrast 
      ? { color: theme.palette.text.primary } 
      // במצב בהיר, משתמשים באפור כהה יותר מברירת המחדל של text.secondary כדי לשפר קריאות (דומה ל-gray-600)
      : { color: theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.text.secondary }; 

  // צבע הרקע של כותרות הטבלה והריחוף (Hover)
  const headerBgStyle = {
    backgroundColor: highContrast 
      ? theme.palette.background.default 
      : alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.05 : 0.1),
    borderBottom: highContrast ? `2px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
  };

const hoverBgStyle = {
    backgroundColor: highContrast 
      ? alpha(theme.palette.text.primary, 0.15) // ה-Hover במצב ניגודיות גבוהה
      : alpha(theme.palette.action.hover, 0.1), // <--- תיקון: הפחתת אטימות ל-10%
    transition: 'background-color 0.15s ease',
  };
  
  // סגנון תגית הקטגוריה
  const categoryChipStyle = {
    backgroundColor: highContrast 
        ? 'transparent' 
        : alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.05),
    color: highContrast 
        ? theme.palette.text.primary 
        : theme.palette.success.main,
    border: highContrast 
        ? `1px solid ${theme.palette.text.primary}` 
        : `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  };
  
  // סגנון כפתורי פעולה
  const getActionButtonStyle = (colorKey: 'primary' | 'success' | 'error' | 'info') => {
    const mainColor = theme.palette[colorKey].main;
    const hoverColor = highContrast ? theme.palette.text.primary : mainColor;

    return {
      color: hoverColor,
      '&:hover': {
        color: hoverColor,
        backgroundColor: highContrast 
            ? alpha(theme.palette.text.primary, 0.15) 
            : alpha(mainColor, 0.1),
      }
    };
  };

  const viewButtonStyle = getActionButtonStyle('info');
  const editButtonStyle = getActionButtonStyle('success');
  const deleteButtonStyle = getActionButtonStyle('error');


  return (
    <div dir={t('common:dir')}>
      {/* --- Books Table --- */}
      <Card 
        id="total-books-section" 
        className="mb-8 shadow-sm"
        style={highContrast ? { border: `2px solid ${theme.palette.text.primary}` } : { border: '0' }}
      >
        <CardHeader>
          <CardTitle style={{ color: theme.palette.text.primary }}>{booksTableTexts.cardTitle}</CardTitle>
          <CardDescription style={{ color: theme.palette.text.secondary }}>
            {booksTableTexts.cardDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* --- Desktop Table --- */}
          <div 
            className="hidden md:block rounded-md border" 
            style={highContrast ? { border: `2px solid ${theme.palette.text.primary}` } : { borderColor: theme.palette.divider }}
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
                      <tr key={i} className="border-b last:border-0" style={{ borderColor: highContrast ? theme.palette.text.primary : theme.palette.divider }}>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3 px-4"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
                      </tr>
                    ))
                  : currentBooks?.map((book) => (
                      <tr
                        key={book._id}
                        style={{ 
                            borderBottom: highContrast ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                            ...(!highContrast && { '&:hover': hoverBgStyle })
                        }}
                        onMouseEnter={(e) => {
                            if (!highContrast) e.currentTarget.style.backgroundColor = hoverBgStyle.backgroundColor;
                        }}
                        onMouseLeave={(e) => {
                            if (!highContrast) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td className="py-3 px-4 font-medium" style={{ color: theme.palette.text.primary }}>{book.title}</td>
                        <td className="py-3 px-4" style={lightTextColorStyle}>
                          {book.author}
                        </td>
                        <td className="py-3 px-4">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0"
                            style={categoryChipStyle}
                          >
                            {book.category}
                          </span>
                        </td>
                        <td className="py-3 px-4" style={lightTextColorStyle}>
                          {userMap[book.user_id]}
                        </td>
                        <td className="py-3 px-4" style={lightTextColorStyle}>
                          {new Date(book.date_created).toLocaleDateString(
                              t('common:locale')
                            )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/book/${book._id}`)}
                              style={viewButtonStyle}
                              aria-label={t("viewDetails")} 
                            >
                              <BookOpen className="h-4 w-4" /> 
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBook(book._id)}
                              style={editButtonStyle}
                              aria-label={t("buttonEdit")}                 
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBook(book._id)}
                              style={deleteButtonStyle}
                              aria-label={t("buttonDelete")}
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
          {/* Small Screen Cards */}
          <div className="md:hidden space-y-4">
            <div className="md:hidden space-y-3">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-3" style={{ borderColor: highContrast ? theme.palette.text.primary : theme.palette.divider }}>
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))
                : currentBooks.map((book) => (
                    <div
                      key={book._id}
                      className="border rounded-lg p-3 transition-shadow"
                      style={highContrast ? { border: `1px solid ${theme.palette.text.primary}` } : { borderColor: theme.palette.divider }}
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate" style={{ color: theme.palette.text.primary }}>
                            {book.title}
                          </h3>
                          <p className="text-xs truncate" style={lightTextColorStyle}>
                            {book.author}
                          </p>
                        </div>
                        <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                            style={categoryChipStyle}
                        >
                          {book.category}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs mb-2" style={lightTextColorStyle}>
                        <span>{userMap[book.user_id]}</span>
                        <span>
                          {new Date(book.date_created).toLocaleDateString(
                              t('common:locale')
                            )}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => navigate(`/book/${book._id}`)}
                          style={highContrast ? { borderColor: theme.palette.text.primary, color: theme.palette.text.primary } : {}}
                          aria-label={t("viewDetails")}
                        >
                          <BookOpen className="h-3.5 w-3.5 ml-1" style={highContrast ? { color: theme.palette.text.primary } : viewButtonStyle} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleEditBook(book._id)}
                          style={highContrast ? { borderColor: theme.palette.text.primary } : {}}
                          aria-label={t("buttonEdit")}
                        >
                          <Edit className="h-3.5 w-3.5" style={highContrast ? { color: theme.palette.text.primary } : editButtonStyle} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleDeleteBook(book._id)}
                           style={highContrast ? { borderColor: theme.palette.text.primary } : {}}
                           aria-label={t("buttonDelete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" style={highContrast ? { color: theme.palette.text.primary } : deleteButtonStyle} />
                        </Button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>{" "}
    </div>
  );
};