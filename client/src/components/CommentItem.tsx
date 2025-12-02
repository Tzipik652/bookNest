import React, { forwardRef } from "react";
import { CommentWithReactions, ReactionType } from "../types";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles"; // 👈 ייבוא חשוב: גישה ל-Theme

interface CommentItemProps {
  comment: CommentWithReactions;
  isBookOwner: boolean;
  currentUserId: string;
  onDelete: () => void;
  onReaction: (commentId: string, reactionType: ReactionType) => void;
}

const CommentItem = forwardRef<HTMLDivElement, CommentItemProps>(({
  comment,
  isBookOwner,
  currentUserId,
  onDelete,
  onReaction,
}, ref) => {
  const { t } = useTranslation("common");
  const theme = useTheme(); // 👈 שימוש ב-Theme
  const currentLocale = t('locale'); 
  const commonDir = t('dir') as 'rtl' | 'ltr';
  const reactions: Array<{ type: ReactionType; emoji: string; color: string }> =
    [
      { type: "like", emoji: "👍", color: "#3b82f6" }, // כחול (כדאי לשקול להשתמש ב-theme.palette.info.main)
      { type: "dislike", emoji: "👎", color: "#ef4444" }, // אדום
      { type: "happy", emoji: "😀", color: "#ec4899" }, // ורוד
      { type: "angry", emoji: "😠", color: "#f59e0b" }, // כתום
    ];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: theme.palette.divider, 
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
      }}
      ref={ref}
      dir={commonDir}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{ width: 40, height: 40, bgcolor: "primary.main" }}
                src={comment.profile_picture || undefined}
              >
                {!comment.profile_picture &&
                  comment.user_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {comment.user_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.created_at).toLocaleDateString(currentLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Stack>
            </Stack>
            {(isBookOwner || currentUserId === comment.user_id) && (
              <IconButton
                onClick={onDelete}
                color="error"
                size="small"
                sx={{ 
                    // ✅ התאמה לניגוד גבוה במצב ריחוף (Dark Mode)
                    "&:hover": { 
                        bgcolor: theme.palette.error.dark,
                        color: theme.palette.error.contrastText 
                    } 
                }}
                aria-label={t('delete_comment', { ns: 'book' })}
              >
                <Trash2 size={18} />
              </IconButton>
            )}
          </Stack>

          {/* Text */}
          <Typography
            variant="body1"
            sx={{ 
                pl: commonDir === 'ltr' ? 7 : 0, 
                pr: commonDir === 'rtl' ? 7 : 0, 
                lineHeight: 1.7, 
                color: "text.primary" 
            }} 
          >
            {comment.text}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {/* Reactions */}
          <Stack direction="row" spacing={1}>
            {reactions.map(({ type, emoji, color }) => {
              const count = comment.reactionCounts[type] || 0;
              const isActive = comment.userReaction === type;

              return (
                <Button
                  key={type}
                  size="small"
                  onClick={() => onReaction(comment.id, type)}
                  sx={{
                    borderRadius: 10,
                    textTransform: "none",
                    minWidth: "auto",
                    px: 2,
                    py: 0.75,
                    border: "2px solid",
                    borderColor: isActive ? color : theme.palette.divider, 
                    bgcolor: isActive ? `${color}15` : theme.palette.background.paper, 
                    color: isActive ? color : theme.palette.text.secondary, 
                    fontWeight: isActive ? 600 : 400,
                  }}
                  aria-label={`${emoji} ${t(type, { ns: 'reaction_type' })}: ${count}`}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      marginRight: count > 0 ? "6px" : 0,
                    }}
                  >
                    {emoji}
                  </span>
                  {count > 0 && (
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  )}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
});

export default CommentItem;