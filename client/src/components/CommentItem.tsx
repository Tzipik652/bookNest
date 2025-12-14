import React, { forwardRef, useState } from "react";
import { CommentWithReactions, ReactionType } from "../types";
import { Trash2, Edit } from "lucide-react"; // הוספתי את Edit
import {
  Card,
  CardContent,
  Button,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Divider,
  TextField, // הוספתי לשימוש בעריכה
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

interface CommentItemProps {
  comment: CommentWithReactions;
  isBookOwner: boolean;
  isAdmin?: boolean; // הוספתי כדי לאפשר למנהל לערוך
  currentUserId: string;
  onDelete: () => void;
  onEdit: (commentId: string, newText: string) => Promise<void>; 
  onReaction: (commentId: string, reactionType: ReactionType) => void;
}

const CommentItem = forwardRef<HTMLDivElement, CommentItemProps>(({
  comment,
  isBookOwner,
  isAdmin = false,
  currentUserId,
  onDelete,
  onEdit,
  onReaction,
}, ref) => {
  const { t } = useTranslation("common");
  const theme = useTheme();
  const currentLocale = t('locale');
  const commonDir = t('dir') as 'rtl' | 'ltr';

  // --- ניהול מצב עריכה ---
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  // הרשאות: כותב התגובה או מנהל יכולים לערוך
  const canEdit = currentUserId === comment.user_id || isAdmin;
  // הרשאות: בעל הספר, כותב התגובה או מנהל יכולים למחוק
  const canDelete = isBookOwner || currentUserId === comment.user_id || isAdmin;

  const handleSaveEdit = async () => {
    if (!editedText.trim()) return;
    try {
      await onEdit(comment.id, editedText);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit comment", error);
    }
  };

  const handleCancelEdit = () => {
    setEditedText(comment.text);
    setIsEditing(false);
  };

  const reactions: Array<{ type: ReactionType; emoji: string; color: string }> =
    [
      { type: "like", emoji: "👍", color: "#3b82f6" },
      { type: "dislike", emoji: "👎", color: "#ef4444" },
      { type: "happy", emoji: "😀", color: "#ec4899" },
      { type: "angry", emoji: "😠", color: "#f59e0b" },
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
            <Stack direction="row" spacing={0} alignItems="center">
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                  mr: commonDir === 'ltr' ? 2 : 0,
                  ml: commonDir === 'rtl' ? 2 : 0,
                }}
                src={comment.user?.profile_picture || undefined}
              >
                {!comment.user?.profile_picture &&
                  comment.user?.name.charAt(0).toUpperCase()}
              </Avatar>

              <Stack spacing={0.5} >
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {comment.user?.name}
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

            {/* Action Buttons (Edit & Delete) */}
            <Stack direction="row" spacing={1}>
              {canEdit && !isEditing && (
                <IconButton
                  onClick={() => setIsEditing(true)}
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                      color: theme.palette.primary.main
                    }
                  }}
                  aria-label={t('edit')}
                >
                  <Edit size={18} />
                </IconButton>
              )}

              {canDelete && !isEditing && (
                <IconButton
                  onClick={onDelete}
                  color="error"
                  size="small"
                  sx={{
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
          </Stack>

          {/* Text Area or Edit Input */}
          {isEditing ? (
            <Stack spacing={2} sx={{ pl: commonDir === 'ltr' ? 7 : 0, pr: commonDir === 'rtl' ? 7 : 0 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ bgcolor: theme.palette.background.default }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveEdit}
                  sx={{ color: '#fff' }} // Ensure text is readable on primary color
                >
                  {t('common:buttonSaveChanges', { defaultValue: 'Save' })}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCancelEdit}
                >
                  {t('buttonCancel', { defaultValue: 'Cancel' })}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography
              variant="body1"
              sx={{
                pl: commonDir === 'ltr' ? 7 : 0,
                pr: commonDir === 'rtl' ? 7 : 0,
                lineHeight: 1.7,
                color: "text.primary",
                whiteSpace: "pre-wrap" 
              }}
            >
              {comment.text}
            </Typography>
          )}

          {!isEditing && <Divider sx={{ my: 1 }} />}

          {/* Reactions - מוסתר בזמן עריכה למראה נקי יותר */}
          {!isEditing && (
            <Stack direction="row" spacing={1}>
              {reactions.map(({ type, emoji, color }) => {
                const count = comment.reaction_counts?.[type] || 0;
                const isActive = comment.user_reaction === type;

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
                        marginLeft: count > 0 && commonDir === 'rtl' ? "6px" : 0,
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
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});

export default CommentItem;