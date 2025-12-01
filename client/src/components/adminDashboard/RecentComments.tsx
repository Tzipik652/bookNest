import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Skeleton, useTheme, alpha } from "@mui/material";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { CardTitle } from "../ui/card";
import { Comment, Book } from "../../types";
import { useNavigate } from "react-router-dom";
import { deleteComment, editComment } from "../../services/commentService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAccessibilityStore } from "../../store/accessibilityStore"; 

interface RecentCommentsProps {
  recentComments: Comment[];
  booksMap: Record<string, Book>;
  userMap: Record<string, string>;
  reactionCounts: Record<string, any>;
  isLoading?: boolean;
}
export function RecentComments({
  recentComments,
  booksMap,
  userMap,
  reactionCounts,
  isLoading,
}: RecentCommentsProps) {
  const { t } = useTranslation(["adminDashboard", "common"]); 
  const commentsTexts = t('dashboard.commentsCard', { returnObjects: true }) as Record<string, string>;
  const currentLocale = t('common:locale');
  
  const theme = useTheme();
  const { highContrast } = useAccessibilityStore(); 

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [comments, setComments] = useState<Comment[]>(recentComments);
  const navigate = useNavigate();

  useEffect(() => {
    setComments(recentComments);
  }, [recentComments]);

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm(commentsTexts.deleteConfirm)) {
      try {
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success(commentsTexts.deleteSuccess);
      } catch (error) {
        toast.error(commentsTexts.deleteFailed);
      }
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingText(comment.text);
  };
  const saveEdit = async () => {
    try {
      if (!editingId || !editingText.trim()) {
        toast.error(commentsTexts.updateFailed);
        return;
      }
      await editComment(editingId!, editingText);

      setComments((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, text: editingText } : c))
      );

      toast.success(commentsTexts.updateSuccess);
      setEditingId(null);
    } catch {
      toast.error(commentsTexts.updateFailed);
    }
  };

  // --- הגדרות עיצוב דינמיות ---
  
  // סגנון כרטיס התגובה
  const commentCardStyle = {
    backgroundColor: theme.palette.background.paper,
    boxShadow: highContrast ? 'none' : theme.shadows[1], 
    border: highContrast ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
    transition: 'box-shadow 0.2s, border-color 0.2s',
  };
  
  // סגנון טקסט ראשי (שם משתמש, תוכן תגובה)
  const primaryTextStyle = { color: theme.palette.text.primary };

  // סגנון טקסט משני/אפור (תאריך, תגובות) - משופר לקריאות במצב בהיר
  const secondaryTextStyle = highContrast 
    ? { color: theme.palette.text.primary } 
    : { color: theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.text.secondary }; 

  // סגנון כותרת הספר (הטקסט הירוק) - ללא סגנון ריחוף כאן
  const bookTitleStyle = { 
    color: highContrast ? theme.palette.text.primary : theme.palette.success.main,
    cursor: 'pointer',
    // במצב ניגודיות גבוהה, תמיד יש קו תחתי
    textDecoration: highContrast ? 'underline' : 'none', 
  };
  
  // סגנון כפתורי פעולה
  const getActionButtonStyle = (colorKey: 'success' | 'error') => {
    const mainColor = theme.palette[colorKey].main;
    const iconColor = highContrast ? theme.palette.text.primary : mainColor;

    return {
      color: iconColor,
      '&:hover': {
        color: iconColor,
        backgroundColor: highContrast 
            ? alpha(theme.palette.text.primary, 0.15) 
            : alpha(mainColor, 0.1),
      }
    };
  };

  const editButtonStyle = getActionButtonStyle('success');
  const deleteButtonStyle = getActionButtonStyle('error');
  
  // סגנון Skeleton (רקע אפור/כהה)
  const skeletonBgColor = highContrast 
    ? theme.palette.text.secondary 
    : theme.palette.mode === 'dark' 
        ? theme.palette.grey[800] 
        : theme.palette.grey[300];


  return (
    <div>
      <Card id="total-comments-section" style={highContrast ? { border: `2px solid ${theme.palette.text.primary}` } : {}}>
        <CardHeader>
          <CardTitle style={primaryTextStyle}>{commentsTexts.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div 
                    key={i} 
                    style={{ backgroundColor: skeletonBgColor }}
                    className="p-4 rounded-lg space-y-3"
                  >
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-48" style={{ backgroundColor: theme.palette.divider }} />
                      <Skeleton className="h-8 w-8" style={{ backgroundColor: theme.palette.divider }} />
                    </div>
                    <Skeleton className="h-4 w-full" style={{ backgroundColor: theme.palette.divider }} />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-12" style={{ backgroundColor: theme.palette.divider }} />
                      <Skeleton className="h-4 w-12" style={{ backgroundColor: theme.palette.divider }} />
                    </div>
                  </div>
                ))
              : comments.map((comment) => {
                  const book = booksMap[comment.book_id];
                  const userName = userMap[comment.user_id] || commentsTexts.unknownUser;
                  const bookTitle = book?.title || commentsTexts.unknownBook;
                  return (
                    <div 
                      key={comment.id} 
                      className="p-4 rounded-lg relative group"
                      style={commentCardStyle} 
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm" style={primaryTextStyle}>
                            <span className="font-medium">
                              {t('dashboard.commentsCard.userOnBook', { userName }) + " "}
                            </span>
                            <span
                              style={bookTitleStyle}
                              // הוספת לוגיקת ריחוף
                              onMouseEnter={(e) => {
                                if (!highContrast) e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                // במצב רגיל, נחזיר ל-none. במצב ניגודיות גבוהה, תמיד יש underline
                                if (!highContrast) e.currentTarget.style.textDecoration = 'none';
                              }}
                              onClick={() =>
                                navigate(`/book/${comment.book_id}`)
                              }
                            >
                              {bookTitle}
                            </span>
                          </p>
                          <p className="text-xs" style={secondaryTextStyle}>
                            {new Date(comment.created_at).toLocaleString(currentLocale)}
                          </p>
                        </div>
                        <div className="absolute top-2 end-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            style={deleteButtonStyle}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          {editingId !== comment.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(comment)}
                              style={editButtonStyle}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            style={{ 
                                width: '100%', 
                                border: `1px solid ${theme.palette.divider}`, 
                                borderRadius: theme.shape.borderRadius,
                                padding: '8px',
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary,
                                outline: 'none',
                            }}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                          />

                          <div className="flex gap-2">
                            <Button 
                                onClick={saveEdit}
                                style={{ 
                                    backgroundColor: theme.palette.success.main, 
                                    color: theme.palette.success.contrastText,
                                }}
                            >
                                {commentsTexts.editSave}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                              style={{ 
                                  color: theme.palette.text.secondary,
                                  backgroundColor: theme.palette.action.hover,
                               }}
                            >
                              {commentsTexts.editCancel}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm" style={primaryTextStyle}>
                            {comment.text}
                          </p>
                          <div className="flex gap-3 text-xs mt-1" style={secondaryTextStyle}>
                            <span>
                              👍 {reactionCounts[comment.id]?.like ?? 0}
                            </span>
                            <span>
                              👎 {reactionCounts[comment.id]?.dislike ?? 0}
                            </span>
                            <span>
                              😊 {reactionCounts[comment.id]?.happy ?? 0}
                            </span>
                            <span>
                              😡 {reactionCounts[comment.id]?.angry ?? 0}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}