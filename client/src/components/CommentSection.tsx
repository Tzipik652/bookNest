import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CommentWithReactions, ReactionType } from "../types";
import {
  getComments,
  addComment,
  deleteComment,
} from "../services/commentService";
import {
  toggleReaction,
  getUserReactionOnComment,
} from "../services/commentReactionService";
import CommentItem from "./CommentItem";
import { useUserStore } from "../store/useUserStore";
import { MessageSquare, Send } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Box,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toast } from "sonner";
import CommentItemSkeleton from "./CommentItemSkeleton";
import { useTranslation } from "react-i18next";

interface CommentSectionProps {
  bookId: string;
  bookOwnerId: string;
}

export function CommentSection({ bookId, bookOwnerId }: CommentSectionProps) {
  const { t } = useTranslation(["comments", "common"]);
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();
  const theme = useTheme();
  const [comments, setComments] = useState<CommentWithReactions[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState<Set<string>>(
    new Set()
  );
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadComments();
  }, [bookId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const loadedComments = await getComments(bookId);

      const commentsWithUserReaction = await Promise.all(
        loadedComments.map(async (comment) => {
          const userReaction = currentUser? await getUserReactionOnComment(comment.id, currentUser._id) : null;
            
          return {
            ...comment,
            userReaction,
            reaction_counts: comment.reaction_counts || { like: 0, dislike: 0, happy: 0, angry: 0 }
          };
        })
      );
      
      setComments(commentsWithUserReaction);      
    } catch (error) {
      console.error(error);
      toast.error(t("errorLoadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      toast.error(t("errorCommentRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const addedComment = await addComment(bookId, newComment.trim());

      // יצירת תגובה חדשה עם מונים מאופסים (שימוש בשם החדש)
      const commentWithReactions: CommentWithReactions = {
        ...addedComment,
        reaction_counts: { like: 0, dislike: 0, happy: 0, angry: 0 },
        userReaction: undefined,
      };

      setComments((prevComments) => [commentWithReactions, ...prevComments]);

      setNewComment("");
      toast.success(t("successAdd"));
      setTimeout(() => {
        commentRefs.current[commentWithReactions.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error(t("errorAddFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      // עדכון אופטימי (מחיקה מהרשימה)
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success(t("successDelete"));
      setCommentToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error(t("errorDeleteFailed"));
    }
  };

  const handleReaction = async (
    commentId: string,
    reactionType: ReactionType
  ) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setLoadingComments((prev) => new Set(prev).add(commentId));

    // עדכון אופטימי
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id !== commentId) return comment;

        const wasActive = comment.userReaction === reactionType;
        
        const newReactionCounts = { ...comment.reaction_counts! };

        if (wasActive) {
          newReactionCounts[reactionType] = Math.max(
            0,
            (newReactionCounts[reactionType] || 0) - 1
          );
          return {
            ...comment,
            reaction_counts: newReactionCounts, // עדכון השדה החדש
            userReaction: undefined,
          };
        }

        // החלפת ריאקציה (אם הייתה אחרת)
        if (comment.userReaction) {
          newReactionCounts[comment.userReaction] = Math.max(
            0,
            (newReactionCounts[comment.userReaction] || 0) - 1
          );
        }

        // הוספת הריאקציה החדשה
        newReactionCounts[reactionType] =
          (newReactionCounts[reactionType] || 0) + 1;

        return {
          ...comment,
          reaction_counts: newReactionCounts, // עדכון השדה החדש
          userReaction: reactionType,
        };
      })
    );

    try {
      await toggleReaction(commentId, reactionType);
    } catch (error) {
      console.error(error);
      toast.error(t("errorAddFailed"));
      await loadComments();
    } finally {
      setLoadingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const isBookOwner = currentUser?._id === bookOwnerId;
  const isAdmin = currentUser?.role === "admin";

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <MessageSquare size={28} />
        <Typography variant="h5" fontWeight={600}>
          {t("title")}
        </Typography>
        <Chip
          label={comments.length}
          color="primary"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {/* Input Area */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={
                currentUser
                  ? t("placeholderLoggedIn")
                  : t("placeholderLoggedOut")
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              disabled={!currentUser || isSubmitting}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!currentUser || isSubmitting || !newComment.trim()}
                endIcon={<Send size={18} />}
                sx={{
                  gap: 1, 
                  "& .MuiButton-endIcon": {
                    margin: 0, 
                  },
                  alignItems: "center",
                }}
                aria-label={isSubmitting ? t("posting") : t("postButton")}
              >
                {isSubmitting ? t("posting") : t("postButton")}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Stack spacing={3}>
        {isLoading ? (
          <CommentItemSkeleton />
        ) : comments.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <MessageSquare
              size={48}
              style={{ opacity: 0.3, marginBottom: 16, color: theme.palette.text.secondary }}
            />
            <Typography variant="body1" color="text.secondary">
              {t("noCommentsText")}
            </Typography>
          </Box>
        ) : (
          comments.map((comment) =>
            loadingComments.has(comment.id) ? (
              <CommentItemSkeleton key={comment.id} />
            ) : (
              <CommentItem
                ref={(el) => {
                  if (el) commentRefs.current[comment.id] = el;
                }}
                key={comment.id}
                comment={comment}
                isBookOwner={isBookOwner || isAdmin}
                currentUserId={currentUser?._id || ""}
                onDelete={() => setCommentToDelete(comment.id)}
                onReaction={handleReaction}
              />
            )
          )
        )}
      </Stack>

      <Dialog
        open={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>{t("deleteTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("deleteConfirm")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCommentToDelete(null)}>{t("common:buttonCancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              commentToDelete && handleDeleteComment(commentToDelete)
            }
            aria-label={t("common:buttonDelete")}
          >
            {t("common:buttonDelete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}