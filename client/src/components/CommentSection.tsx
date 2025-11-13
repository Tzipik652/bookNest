// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Comment, ReactionType } from '../types';
// import {
//     getComments,
//     addComment,
//     deleteComment,
//     toggleReaction,
//     getCommentReactionCounts,
//     getUserReactionOnComment
// } from '../services/commentService';
// import { useUserStore } from "../store/useUserStore";
// import { ThumbsUp, ThumbsDown, Smile, Angry, Trash2, MessageSquare } from 'lucide-react';
// import {
//     Card,
//     CardContent,
//     CardActions,
//     Button,
//     TextField,
//     Typography,
//     IconButton,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogContentText,
//     DialogActions,
//     Stack
// } from '@mui/material';
// import { toast } from 'sonner';

// interface CommentSectionProps {
//     bookId: string;
//     bookOwnerId: string;
// }

// export function CommentSection({ bookId, bookOwnerId }: CommentSectionProps) {
//     const navigate = useNavigate();
//     const { user: currentUser } = useUserStore();
//     const [comments, setComments] = useState<CommentWithReactions[]>([]);
//     const [newComment, setNewComment] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

//     useEffect(() => {
//         loadComments();
//     }, [bookId]);
//     // בתוך CommentSection.tsx
//     const loadComments = async () => {
//         try {
//             const loadedComments = await getComments(bookId);
//             setComments(loadedComments);
//         } catch (error) {
//             console.error(error);
//             toast.error("Failed to load comments");
//         }
//     };

//     const handleAddComment = async () => {
//         if (!currentUser) {
//             navigate('/login');
//             return;
//         }

//         if (!newComment.trim()) {
//             toast.error('Please enter a comment');
//             return;
//         }

//         setIsSubmitting(true);
//         try {
//             await addComment(bookId, newComment.trim());
//             setNewComment('');
//             await loadComments();
//             toast.success('Comment added successfully');
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to add comment');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleDeleteComment = async (commentId: string) => {
//         try {
//             await deleteComment(commentId);
//             await loadComments();
//             toast.success('Comment deleted');
//             setCommentToDelete(null);
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to delete comment');
//         }
//     };

//     const handleReaction = async (commentId: string, reactionType: ReactionType) => {
//         if (!currentUser) {
//             navigate('/login');
//             return;
//         }

//         try {
//             await toggleReaction(commentId, reactionType);
//             await loadComments();
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to add reaction');
//         }
//     };

//     const isBookOwner = currentUser?._id === bookOwnerId;

//     return (
//         <Stack spacing={4}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//                 <MessageSquare />
//                 <Typography variant="h6">Comments ({comments.length})</Typography>
//             </Stack>

//             {/* Add Comment Form */}
//             <Card>
//                 <CardContent>
//                     <TextField
//                         fullWidth
//                         multiline
//                         minRows={4}
//                         placeholder={currentUser ? "Share your thoughts about this book..." : "Please log in to comment"}
//                         value={newComment}
//                         onChange={(e) => setNewComment(e.target.value)}
//                         disabled={!currentUser || isSubmitting}
//                     />
//                 </CardContent>
//                 <CardActions sx={{ justifyContent: 'flex-end' }}>
//                     <Button
//                         variant="contained"
//                         onClick={handleAddComment}
//                         disabled={!currentUser || isSubmitting || !newComment.trim()}
//                     >
//                         {isSubmitting ? 'Posting...' : 'Post Comment'}
//                     </Button>
//                 </CardActions>
//             </Card>

//             {/* Comments List */}
//             <Stack spacing={2}>
//                 {comments.length === 0 ? (
//                     <Card>
//                         <CardContent>
//                             <Typography variant="body2" color="textSecondary" align="center">
//                                 No comments yet. Be the first to share your thoughts!
//                             </Typography>
//                         </CardContent>
//                     </Card>
//                 ) : (
//                     comments.map((comment) => (
//                         <CommentItem
//                             key={comment.id}
//                             comment={comment}
//                             isBookOwner={isBookOwner}
//                             onDelete={() => setCommentToDelete(comment.id)}
//                             onReaction={handleReaction}
//                         />
//                     ))
//                 )}
//             </Stack>

//             {/* Delete Confirmation Dialog */}
//             <Dialog open={!!commentToDelete} onClose={() => setCommentToDelete(null)}>
//                 <DialogTitle>Delete Comment</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Are you sure you want to delete this comment? This action cannot be undone.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setCommentToDelete(null)}>Cancel</Button>
//                     <Button
//                         color="error"
//                         onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
//                     >
//                         Delete
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </Stack>
//     );
// }

// interface CommentItemProps {
//     comment: Comment;
//     isBookOwner: boolean;
//     onDelete: () => void;
//     onReaction: (commentId: string, reactionType: ReactionType) => void;
// }

// function CommentItem({ comment, isBookOwner, onDelete, onReaction }: CommentItemProps) {
//     const reactionCounts = getCommentReactionCounts(comment);
//     const userReaction = getUserReactionOnComment(comment, useUserStore.getState().user?._id || '');

//     type ReactionType = "like" | "dislike" | "happy" | "angry";

//     const reactions: Array<{ type: ReactionType; icon: typeof ThumbsUp }> = [
//         { type: "like", icon: ThumbsUp },
//         { type: "dislike", icon: ThumbsDown },
//         { type: "happy", icon: Smile },
//         { type: "angry", icon: Angry },
//     ];


//     return (
//         <Card>
//             <CardContent>
//                 <Stack spacing={1}>
//                     {/* Comment Header */}
//                     <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//                         <Stack>
//                             <Typography variant="subtitle2">{comment.user_id}</Typography>
//                             <Typography variant="caption" color="textSecondary">
//                                 {new Date(comment.created_at).toLocaleDateString('en-US', {
//                                     year: 'numeric',
//                                     month: 'short',
//                                     day: 'numeric',
//                                     hour: '2-digit',
//                                     minute: '2-digit'
//                                 })}
//                             </Typography>
//                         </Stack>
//                         {isBookOwner && (
//                             <IconButton onClick={onDelete} color="error">
//                                 <Trash2 />
//                             </IconButton>
//                         )}
//                     </Stack>

//                     {/* Comment Text */}
//                     <Typography variant="body1">{comment.text}</Typography>

//                     {/* Reactions */}
//                     <Stack direction="row" spacing={1} mt={1}>
//                         {reactions.map(({ type, icon: Icon }) => {
//                             const count = Number(reactionCounts[type as keyof typeof reactionCounts] || 0);
//                             const isActive = userReaction === type;

//                             return (
//                                 <Button
//                                     key={type}
//                                     variant={isActive ? "contained" : "outlined"}
//                                     size="small"
//                                     startIcon={<Icon />}
//                                     onClick={() => onReaction(comment.id, type)}
//                                 >
//                                     {count > 0 ? count : null} {/* עכשיו count בטוח מספר */}
//                                 </Button>
//                             );
//                         })}
//                     </Stack>
//                 </Stack>
//             </CardContent>
//         </Card>
//     );
// }


















// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Comment, CommentWithReactions, ReactionType, ReactionCounts } from '../types';
// import {
//     getComments,
//     addComment,
//     deleteComment,
//     toggleReaction,
//     getCommentReactionCounts,
//     getUserReactionOnComment
// } from '../services/commentService';
// import { useUserStore } from "../store/useUserStore";
// import { Trash2, MessageSquare, Send } from 'lucide-react';
// import {
//     Card,
//     CardContent,
//     Button,
//     TextField,
//     Typography,
//     IconButton,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogContentText,
//     DialogActions,
//     Stack,
//     Box,
//     Avatar,
//     Chip,
//     Divider
// } from '@mui/material';
// import { toast } from 'sonner';

// interface CommentSectionProps {
//     bookId: string;
//     bookOwnerId: string;
// }

// export function CommentSection({ bookId, bookOwnerId }: CommentSectionProps) {
//     const navigate = useNavigate();
//     const { user: currentUser } = useUserStore();
//     const [comments, setComments] = useState<CommentWithReactions[]>([]);
//     const [newComment, setNewComment] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

//     useEffect(() => {
//         loadComments();
//     }, [bookId]);

//     const loadComments = async () => {
//         try {
//             const loadedComments = await getComments(bookId);

//             const commentsWithReactions = await Promise.all(
//                 loadedComments.map(async (comment: Comment) => {
//                     const [reactionCounts, userReaction] = await Promise.all([
//                         getCommentReactionCounts(comment),
//                         currentUser ? getUserReactionOnComment(comment, currentUser._id) : Promise.resolve(null),
//                     ]);
//                     return {
//                         ...comment,
//                         reactionCounts,
//                         userReaction,
//                     };
//                 })
//             );

//             setComments(commentsWithReactions);
//         } catch (error) {
//             console.error(error);
//             toast.error("Failed to load comments");
//         }
//     };

//     const handleAddComment = async () => {
//         if (!currentUser) {
//             navigate('/login');
//             return;
//         }

//         if (!newComment.trim()) {
//             toast.error('Please enter a comment');
//             return;
//         }

//         setIsSubmitting(true);
//         try {
//             await addComment(bookId, newComment.trim());
//             setNewComment('');
//             await loadComments();
//             toast.success('Comment added successfully');
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to add comment');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleDeleteComment = async (commentId: string) => {
//         try {
//             await deleteComment(commentId);
//             await loadComments();
//             toast.success('Comment deleted');
//             setCommentToDelete(null);
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to delete comment');
//         }
//     };

//     const handleReaction = async (commentId: string, reactionType: ReactionType) => {
//         if (!currentUser) {
//             navigate('/login');
//             return;
//         }

//         try {
//             const result = await toggleReaction(commentId, reactionType);

//             setComments(prev =>
//                 prev.map(comment => {
//                     // כאן צריך לקחת את userReaction מתוך comment
//                     const currentUserReaction = comment.userReaction; // ✅
//                     const isSameReaction = currentUserReaction === reactionType;

//                     const newReactionCounts: ReactionCounts = { ...comment.reactionCounts };
//                     if (isSameReaction) {
//                         newReactionCounts[reactionType] = Math.max(0, (newReactionCounts[reactionType] || 1) - 1);
//                     } else {
//                         if (currentUserReaction) {
//                             newReactionCounts[currentUserReaction] = Math.max(0, (newReactionCounts[currentUserReaction] || 1) - 1);
//                         }
//                         newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;
//                     }

//                     return {
//                         ...comment,
//                         userReaction: isSameReaction ? undefined : reactionType,
//                         reactionCounts: newReactionCounts,
//                     };
//                 })
//             );
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to add reaction');
//         }
//     };


//     const isBookOwner = currentUser?._id === bookOwnerId;

//     return (
//         <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
//             {/* Header */}
//             <Stack direction="row" alignItems="center" spacing={2} mb={4}>
//                 <MessageSquare size={28} />
//                 <Typography variant="h5" fontWeight={600}>
//                     Comments
//                 </Typography>
//                 <Chip
//                     label={comments.length}
//                     color="primary"
//                     size="small"
//                     sx={{ fontWeight: 600 }}
//                 />
//             </Stack>

//             {/* Add Comment Form */}
//             <Card
//                 elevation={0}
//                 sx={{
//                     mb: 4,
//                     border: '1px solid',
//                     borderColor: 'divider',
//                     borderRadius: 2,
//                     '&:hover': {
//                         borderColor: 'primary.main',
//                         transition: 'border-color 0.3s'
//                     }
//                 }}
//             >
//                 <CardContent sx={{ p: 3 }}>
//                     <Stack spacing={2}>
//                         <TextField
//                             fullWidth
//                             multiline
//                             rows={4}
//                             placeholder={currentUser ? "Share your thoughts about this book..." : "Please log in to comment"}
//                             value={newComment}
//                             onChange={(e) => setNewComment(e.target.value)}
//                             disabled={!currentUser || isSubmitting}
//                             variant="outlined"
//                             sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                     borderRadius: 2,
//                                 }
//                             }}
//                         />
//                         <Box display="flex" justifyContent="flex-end">
//                             <Button
//                                 variant="contained"
//                                 onClick={handleAddComment}
//                                 disabled={!currentUser || isSubmitting || !newComment.trim()}
//                                 endIcon={<Send size={18} />}
//                                 sx={{
//                                     borderRadius: 2,
//                                     textTransform: 'none',
//                                     px: 3,
//                                     py: 1
//                                 }}
//                             >
//                                 {isSubmitting ? 'Posting...' : 'Post Comment'}
//                             </Button>
//                         </Box>
//                     </Stack>
//                 </CardContent>
//             </Card>

//             {/* Comments List */}
//             <Stack spacing={3}>
//                 {comments.length === 0 ? (
//                     <Box
//                         sx={{
//                             textAlign: 'center',
//                             py: 8,
//                             px: 3,
//                             bgcolor: 'grey.50',
//                             borderRadius: 2
//                         }}
//                     >
//                         <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
//                         <Typography variant="body1" color="text.secondary">
//                             No comments yet. Be the first to share your thoughts!
//                         </Typography>
//                     </Box>
//                 ) : (comments.map((comment) => (
//                         <CommentItem
//                             key={comment.id}
//                             comment={comment}
//                             isBookOwner={isBookOwner}
//                             currentUserId={currentUser?._id || ''}
//                             onDelete={() => setCommentToDelete(comment.id)}
//                             onReaction={handleReaction}
//                         />
//                     ))
//                 )}
//             </Stack>

//             {/* Delete Confirmation Dialog */}
//             <Dialog
//                 open={!!commentToDelete}
//                 onClose={() => setCommentToDelete(null)}
//                 PaperProps={{
//                     sx: { borderRadius: 2 }
//                 }}
//             >
//                 <DialogTitle>Delete Comment</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Are you sure you want to delete this comment? This action cannot be undone.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions sx={{ p: 2 }}>
//                     <Button
//                         onClick={() => setCommentToDelete(null)}
//                         sx={{ textTransform: 'none' }}
//                     >
//                         Cancel
//                     </Button>
//                     <Button
//                         variant="contained"
//                         color="error"
//                         onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
//                         sx={{ textTransform: 'none' }}
//                     >
//                         Delete
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </Box>
//     );
// }

// interface CommentItemProps {
//     comment: Comment;
//     isBookOwner: boolean;
//     currentUserId: string;
//     onDelete: () => void;
//     onReaction: (commentId: string, reactionType: ReactionType) => void;
// }

// function CommentItem({ comment, isBookOwner, currentUserId, onDelete, onReaction }: CommentItemProps) {
//     const commentWithReactions = comment as CommentWithReactions;
//     const reactionCounts = commentWithReactions.reactionCounts;
//     const userReaction = commentWithReactions.userReaction;

//     const reactions: Array<{ type: ReactionType; emoji: string; label: string; color: string }> = [
//         { type: "like", emoji: "👍", label: "Like", color: "#3b82f6" },
//         { type: "dislike", emoji: "👎", label: "Dislike", color: "#ef4444" },
//         { type: "happy", emoji: "❤️", label: "Love", color: "#ec4899" },
//         { type: "angry", emoji: "😢", label: "Sad", color: "#f59e0b" },
//     ];

//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 border: '1px solid',
//                 borderColor: 'divider',
//                 borderRadius: 2,
//                 transition: 'all 0.2s',
//                 '&:hover': {
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//                 }
//             }}
//         >
//             <CardContent sx={{ p: 3 }}>
//                 <Stack spacing={2}>
//                     {/* Comment Header */}
//                     <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//                         <Stack direction="row" spacing={2} alignItems="center">
//                             <Avatar
//                                 sx={{
//                                     width: 40,
//                                     height: 40,
//                                     bgcolor: 'primary.main'
//                                 }}
//                             >
//                                 {comment.user_id.charAt(0).toUpperCase()}
//                             </Avatar>
//                             <Stack spacing={0.5}>
//                                 <Typography variant="subtitle1" fontWeight={600}>
//                                     {comment.user_id}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                     {new Date(comment.created_at).toLocaleDateString('en-US', {
//                                         year: 'numeric',
//                                         month: 'short',
//                                         day: 'numeric',
//                                         hour: '2-digit',
//                                         minute: '2-digit'
//                                     })}
//                                 </Typography>
//                             </Stack>
//                         </Stack>
//                         {isBookOwner && (
//                             <IconButton
//                                 onClick={onDelete}
//                                 color="error"
//                                 size="small"
//                                 sx={{
//                                     '&:hover': {
//                                         bgcolor: 'error.lighter'
//                                     }
//                                 }}
//                             >
//                                 <Trash2 size={18} />
//                             </IconButton>
//                         )}
//                     </Stack>

//                     {/* Comment Text */}
//                     <Typography
//                         variant="body1"
//                         sx={{
//                             pl: 7,
//                             lineHeight: 1.7,
//                             color: 'text.primary'
//                         }}
//                     >
//                         {comment.text}
//                     </Typography>

//                     <Divider sx={{ my: 1 }} />

//                     {/* Reactions */}
//                     <Stack direction="row" spacing={1}>
//                         {reactions.map(({ type, emoji, color }) => {
//                             const count = reactionCounts[type] || 0;
//                             const isActive = userReaction === type;

//                             return (
//                                 <Button
//                                     key={type}
//                                     size="small"
//                                     onClick={() => onReaction(comment.id, type)}
//                                     sx={{
//                                         borderRadius: 10,
//                                         textTransform: 'none',
//                                         minWidth: 'auto',
//                                         px: 2,
//                                         py: 0.75,
//                                         border: '2px solid',
//                                         borderColor: isActive ? color : '#e5e7eb',
//                                         bgcolor: isActive ? `${color}15` : 'white',
//                                         color: isActive ? color : '#6b7280',
//                                         fontWeight: isActive ? 600 : 400,
//                                     }}
//                                 >
//                                     <span style={{ fontSize: '18px', marginRight: count > 0 ? '6px' : 0 }}>{emoji}</span>
//                                     {count > 0 && <span style={{ fontWeight: 600 }}>{count}</span>}
//                                 </Button>
//                             );
//                         })}
//                     </Stack>
//                 </Stack>
//             </CardContent>
//         </Card>
//     );
// }






import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommentWithReactions, ReactionType } from '../types';
import {
    getComments,
    addComment,
    deleteComment
} from '../services/commentService';
import {
    toggleReaction,
    getCommentReactionCounts,
    getUserReactionOnComment
} from '../services/commentReactionService';
import CommentItem from './CommentItem';
import { useUserStore } from "../store/useUserStore";
import { Trash2, MessageSquare, Send } from 'lucide-react';
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
    Chip
} from '@mui/material';
import { toast } from 'sonner';

interface CommentSectionProps {
    bookId: string;
    bookOwnerId: string;
}

export function CommentSection({ bookId, bookOwnerId }: CommentSectionProps) {
    const navigate = useNavigate();
    const { user: currentUser } = useUserStore();
    const [comments, setComments] = useState<CommentWithReactions[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadComments();
    }, [bookId]);

    /** טוען תגובות + reaction info */
    const loadComments = async () => {
        try {
            const loadedComments = await getComments(bookId);

            const commentsWithReactions = await Promise.all(
                loadedComments.map(async (comment) => {
                    const reactionCounts = await getCommentReactionCounts(comment);
                    const userReaction = currentUser
                        ? await getUserReactionOnComment(comment.id, currentUser._id)
                        : null;
                    return {
                        ...comment,
                        reactionCounts,
                        userReaction,
                    };
                })
            );

            setComments(commentsWithReactions);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load comments");
        }
    };

    /** הוספת תגובה */
    const handleAddComment = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (!newComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        setIsSubmitting(true);
        try {
            await addComment(bookId, newComment.trim());
            setNewComment('');
            await loadComments();
            toast.success('Comment added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    /** מחיקת תגובה */
    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            await loadComments();
            toast.success('Comment deleted');
            setCommentToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete comment');
        }
    };

    /** טיפול בריאקציות */
    const handleReaction = async (commentId: string, reactionType: ReactionType) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            await toggleReaction(commentId, reactionType);
            await loadComments(); // טוען מחדש את כל התגובות עם reaction counts
        } catch (error) {
            console.error(error);
            toast.error('Failed to add reaction');
        }
    };

    const isBookOwner = currentUser?._id === bookOwnerId;

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <MessageSquare size={28} />
                <Typography variant="h5" fontWeight={600}>
                    Comments
                </Typography>
                <Chip
                    label={comments.length}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600 }}
                />
            </Stack>

            {/* Add Comment Form */}
            <Card elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder={currentUser ? "Share your thoughts about this book..." : "Please log in to comment"}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!currentUser || isSubmitting}
                        />
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                onClick={handleAddComment}
                                disabled={!currentUser || isSubmitting || !newComment.trim()}
                                endIcon={<Send size={18} />}
                            >
                                {isSubmitting ? 'Posting...' : 'Post Comment'}
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Comments List */}
            <Stack spacing={3}>
                {comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, px: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <Typography variant="body1" color="text.secondary">
                            No comments yet. Be the first to share your thoughts!
                        </Typography>
                    </Box>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isBookOwner={isBookOwner}
                            currentUserId={currentUser?._id || ''}
                            onDelete={() => setCommentToDelete(comment.id)}
                            onReaction={handleReaction}
                        />
                    ))
                )}
            </Stack>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!commentToDelete}
                onClose={() => setCommentToDelete(null)}
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle>Delete Comment</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this comment? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCommentToDelete(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}



// interface CommentItemProps {
//     comment: Comment;
//     isBookOwner: boolean;
//     currentUserId: string;
//     onDelete: () => void;
//     onReaction: (commentId: string, reactionType: ReactionType) => void;
// }

// function CommentItem({ comment, isBookOwner, currentUserId, onDelete, onReaction }: CommentItemProps) {
//     const commentWithReactions = comment as CommentWithReactions;
//     const reactionCounts = commentWithReactions.reactionCounts;
//     const userReaction = commentWithReactions.userReaction;

//     const reactions: Array<{ type: ReactionType; emoji: string; label: string; color: string }> = [
//         { type: "like", emoji: "👍", label: "Like", color: "#3b82f6" },
//         { type: "dislike", emoji: "👎", label: "Dislike", color: "#ef4444" },
//         { type: "happy", emoji: "❤️", label: "Love", color: "#ec4899" },
//         { type: "angry", emoji: "😢", label: "Sad", color: "#f59e0b" },
//     ];

//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 border: '1px solid',
//                 borderColor: 'divider',
//                 borderRadius: 2,
//                 transition: 'all 0.2s',
//                 '&:hover': {
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//                 }
//             }}
//         >
//             <CardContent sx={{ p: 3 }}>
//                 <Stack spacing={2}>
//                     {/* Comment Header */}
//                     <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//                         <Stack direction="row" spacing={2} alignItems="center">
//                             <Avatar
//                                 sx={{
//                                     width: 40,
//                                     height: 40,
//                                     bgcolor: 'primary.main'
//                                 }}
//                             >
//                                 {comment.user_id.charAt(0).toUpperCase()}
//                             </Avatar>
//                             <Stack spacing={0.5}>
//                                 <Typography variant="subtitle1" fontWeight={600}>
//                                     {comment.user_id}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                     {new Date(comment.created_at).toLocaleDateString('en-US', {
//                                         year: 'numeric',
//                                         month: 'short',
//                                         day: 'numeric',
//                                         hour: '2-digit',
//                                         minute: '2-digit'
//                                     })}
//                                 </Typography>
//                             </Stack>
//                         </Stack>
//                         {isBookOwner && (
//                             <IconButton
//                                 onClick={onDelete}
//                                 color="error"
//                                 size="small"
//                                 sx={{
//                                     '&:hover': {
//                                         bgcolor: 'error.lighter'
//                                     }
//                                 }}
//                             >
//                                 <Trash2 size={18} />
//                             </IconButton>
//                         )}
//                     </Stack>

//                     {/* Comment Text */}
//                     <Typography
//                         variant="body1"
//                         sx={{
//                             pl: 7,
//                             lineHeight: 1.7,
//                             color: 'text.primary'
//                         }}
//                     >
//                         {comment.text}
//                     </Typography>

//                     <Divider sx={{ my: 1 }} />

//                     {/* Reactions */}
//                     <Stack direction="row" spacing={1}>
//                         {reactions.map(({ type, emoji, color }) => {
//                             const count = reactionCounts[type] || 0;
//                             const isActive = userReaction === type;

//                             return (
//                                 <Button
//                                     key={type}
//                                     size="small"
//                                     onClick={() => onReaction(comment.id, type)}
//                                     sx={{
//                                         borderRadius: 10,
//                                         textTransform: 'none',
//                                         minWidth: 'auto',
//                                         px: 2,
//                                         py: 0.75,
//                                         border: '2px solid',
//                                         borderColor: isActive ? color : '#e5e7eb',
//                                         bgcolor: isActive ? `${color}15` : 'white',
//                                         color: isActive ? color : '#6b7280',
//                                         fontWeight: isActive ? 600 : 400,
//                                     }}
//                                 >
//                                     <span style={{ fontSize: '18px', marginRight: count > 0 ? '6px' : 0 }}>{emoji}</span>
//                                     {count > 0 && <span style={{ fontWeight: 600 }}>{count}</span>}
//                                 </Button>
//                             );
//                         })}
//                     </Stack>
//                 </Stack>
//             </CardContent>
//         </Card>
//     );
// }