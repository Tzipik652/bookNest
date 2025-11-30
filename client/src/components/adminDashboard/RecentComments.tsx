import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Skeleton } from "@mui/material";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { CardTitle } from "../ui/card";
import { Comment, Book } from "../../types";
import { useNavigate } from "react-router-dom";
import { deleteComment, editComment } from "../../services/commentService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["adminDashboard", "common"]); // טעינת Namespaces
  const commentsTexts = t('dashboard.commentsCard', { returnObjects: true }) as any;
  const currentLocale = t('common:locale');

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

  return (
    <div>
      {/* --- Recent Comments Skeleton --- */}
      <Card id="total-comments-section">
        <CardHeader>
          <CardTitle>{commentsTexts.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))
              : comments.map((comment) => {
                const book = booksMap[comment.book_id];
                const userName = userMap[comment.user_id] || commentsTexts.unknownUser;
                const bookTitle = book?.title || commentsTexts.unknownBook;
                return (
                  <div key={comment.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">
                            {/* שימוש ב-userMap ובמפתח התרגום לצירוף */}
                            {t('dashboard.commentsCard.userOnBook', { userName }) + " "}
                          </span>
                          <span
                            className="text-green-600 hover:underline cursor-pointer"
                            onClick={() =>
                              navigate(`/book/${comment.book_id}`)
                            }
                          >
                            {bookTitle}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString(currentLocale)}
                        </p>
                      </div>
                      <div className="absolute top-2 end-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>

                        {editingId !== comment.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(comment)}
                          >
                            <Edit className="h-3.5 w-3.5 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full border rounded p-2"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                        />

                        <div className="flex gap-2">
                          <Button onClick={saveEdit}>{commentsTexts.editSave}</Button>
                          <Button
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            {commentsTexts.editCancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">
                          {comment.text}
                        </p>
                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
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
