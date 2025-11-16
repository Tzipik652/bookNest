// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CommentWithReactions, ReactionType } from '../types';
// import {
//     getComments,
//     addComment,
//     deleteComment,
//     getCommentById
// } from '../services/commentService';
// import {
//     toggleReaction,
//     getCommentReactionCounts,
//     getUserReactionOnComment
// } from '../services/commentReactionService';
// import CommentItem from './CommentItem';
// import { useUserStore } from "../store/useUserStore";
// import { MessageSquare, Send } from 'lucide-react';
// import {
//     Card,
//     CardContent,
//     Button,
//     TextField,
//     Typography,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogContentText,
//     DialogActions,
//     Stack,
//     Box,
//     Chip
// } from '@mui/material';
// import { toast } from 'sonner';
// import CommentItemSkeleton from './CommentItemSkeleton';

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
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         loadComments();
//     }, [bookId]);

//     const loadComments = async () => {
//         setIsLoading(true);
//         try {
//             const loadedComments = await getComments(bookId);

//             const commentsWithReactions = await Promise.all(
//                 loadedComments.map(async (comment) => {
//                     const reactionCounts = await getCommentReactionCounts(comment);
//                     const userReaction = currentUser
//                         ? await getUserReactionOnComment(comment.id, currentUser._id)
//                         : null;
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
//             setIsLoading(false);
//         } finally {
//             setIsLoading(false);
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

//     // const handleReaction = async (commentId: string, reactionType: ReactionType) => {
//     //     if (!currentUser) {
//     //         navigate('/login');
//     //         return;
//     //     }

//     //     try {
//     //         await toggleReaction(commentId, reactionType);
//     //         await loadComments();
//     //     } catch (error) {
//     //         console.error(error);
//     //         toast.error('Failed to add reaction');
//     //     }
//     // };
//     const handleReaction = async (commentId: string, reactionType: ReactionType) => {
//         if (!currentUser) {
//             navigate('/login');
//             return;
//         }

//         try {
//             // עדכון אופטימיסטי מהיר
//             setComments(prevComments =>
//                 prevComments.map(comment => {
//                     if (comment.id !== commentId) return comment;

//                     const wasActive = comment.userReaction === reactionType;
//                     const newReactionCounts = { ...comment.reactionCounts };

//                     if (wasActive) {
//                         newReactionCounts[reactionType] = Math.max(0, (newReactionCounts[reactionType] || 0) - 1);
//                         return {
//                             ...comment,
//                             reactionCounts: newReactionCounts,
//                             userReaction: undefined
//                         };
//                     }

//                     if (comment.userReaction) {
//                         newReactionCounts[comment.userReaction] = Math.max(0, (newReactionCounts[comment.userReaction] || 0) - 1);
//                     }

//                     newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;

//                     return {
//                         ...comment,
//                         reactionCounts: newReactionCounts,
//                         userReaction: reactionType
//                     };
//                 })
//             );

//             // שליחה לשרת
//             await toggleReaction(commentId, reactionType);

//             // עדכון רק התגובה הספציפית מהשרת
//             const updatedComment = await getCommentById(commentId);
//             const reactionCounts = await getCommentReactionCounts(updatedComment);
//             const userReaction = await getUserReactionOnComment(commentId, currentUser._id);

//             setComments(prevComments =>
//                 prevComments.map(comment =>
//                     comment.id === commentId
//                         ? { ...updatedComment, reactionCounts, userReaction }
//                         : comment
//                 )
//             );

//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to add reaction');
//             // רק במקרה של שגיאה, טענו את כל התגובות
//             await loadComments();
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
//             <Card elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
//                         />
//                         <Box display="flex" justifyContent="flex-end">
//                             <Button
//                                 variant="contained"
//                                 onClick={handleAddComment}
//                                 disabled={!currentUser || isSubmitting || !newComment.trim()}
//                                 endIcon={<Send size={18} />}
//                             >
//                                 {isSubmitting ? 'Posting...' : 'Post Comment'}
//                             </Button>
//                         </Box>
//                     </Stack>
//                 </CardContent>
//             </Card>

//             {/* Comments List */}
//             <Stack spacing={3}>
//                 {isLoading ? (
//                     <CommentItemSkeleton />
//                 ) : comments.length === 0 ? (
//                     <Box sx={{ textAlign: 'center', py: 8, px: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
//                         <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
//                         <Typography variant="body1" color="text.secondary">
//                             No comments yet. Be the first to share your thoughts!
//                         </Typography>
//                     </Box>
//                 ) : (
//                     comments.map((comment) => (
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
//                 PaperProps={{ sx: { borderRadius: 2 } }}
//             >
//                 <DialogTitle>Delete Comment</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Are you sure you want to delete this comment? This action cannot be undone.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions sx={{ p: 2 }}>
//                     <Button onClick={() => setCommentToDelete(null)}>Cancel</Button>
//                     <Button
//                         variant="contained"
//                         color="error"
//                         onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
//                     >
//                         Delete
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </Box>
//     );
// }

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommentWithReactions, ReactionType } from '../types';
import {
    getComments,
    addComment,
    deleteComment,
    getCommentById
} from '../services/commentService';
import {
    toggleReaction,
    getCommentReactionCounts,
    getUserReactionOnComment
} from '../services/commentReactionService';
import CommentItem from './CommentItem';
import { useUserStore } from "../store/useUserStore";
import { MessageSquare, Send } from 'lucide-react';
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
import CommentItemSkeleton from './CommentItemSkeleton';

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
    const [isLoading, setIsLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadComments();
    }, [bookId]);

    const loadComments = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    // const handleAddComment = async () => {
    //     if (!currentUser) {
    //         navigate('/login');
    //         return;
    //     }

    //     if (!newComment.trim()) {
    //         toast.error('Please enter a comment');
    //         return;
    //     }

    //     setIsSubmitting(true);
    //     try {
    //         await addComment(bookId, newComment.trim());
    //         setNewComment('');
    //         await loadComments();
    //         toast.success('Comment added successfully');
    //     } catch (error) {
    //         console.error(error);
    //         toast.error('Failed to add comment');
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };
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
        const addedComment = await addComment(bookId, newComment.trim());
        
        // טען את הנתונים המלאים של התגובה החדשה
        const reactionCounts = await getCommentReactionCounts(addedComment);
        const userReaction = currentUser
            ? await getUserReactionOnComment(addedComment.id, currentUser._id)
            : undefined;

        const commentWithReactions: CommentWithReactions = {
            ...addedComment,
            reactionCounts,
            userReaction,
        };

        // הוסף את התגובה החדשה לתחילת הרשימה (או לסוף, תלוי בהעדפה)
        setComments(prevComments => [commentWithReactions, ...prevComments]);
        
        setNewComment('');
        toast.success('Comment added successfully');
    } catch (error) {
        console.error(error);
        toast.error('Failed to add comment');
    } finally {
        setIsSubmitting(false);
    }
};
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

    const handleReaction = async (commentId: string, reactionType: ReactionType) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // הוסף את התגובה לרשימת הטעינה
        setLoadingComments(prev => new Set(prev).add(commentId));

        try {
            // עדכון אופטימיסטי מהיר
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id !== commentId) return comment;

                    const wasActive = comment.userReaction === reactionType;
                    const newReactionCounts = { ...comment.reactionCounts };

                    if (wasActive) {
                        newReactionCounts[reactionType] = Math.max(0, (newReactionCounts[reactionType] || 0) - 1);
                        return {
                            ...comment,
                            reactionCounts: newReactionCounts,
                            userReaction: undefined
                        };
                    }

                    if (comment.userReaction) {
                        newReactionCounts[comment.userReaction] = Math.max(0, (newReactionCounts[comment.userReaction] || 0) - 1);
                    }

                    newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;

                    return {
                        ...comment,
                        reactionCounts: newReactionCounts,
                        userReaction: reactionType
                    };
                })
            );

            // שליחה לשרת
            await toggleReaction(commentId, reactionType);

            // עדכון מהשרת
            const updatedComment = await getCommentById(commentId);
            const reactionCounts = await getCommentReactionCounts(updatedComment);
            const userReaction = await getUserReactionOnComment(commentId, currentUser._id);

            setComments(prevComments =>
                prevComments.map(comment =>
                    comment.id === commentId
                        ? { ...updatedComment, reactionCounts, userReaction }
                        : comment
                )
            );

        } catch (error) {
            console.error(error);
            toast.error('Failed to add reaction');
            // רק במקרה של שגיאה, טענו את כל התגובות
            await loadComments();
        } finally {
            // הסר את התגובה מרשימת הטעינה
            setLoadingComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
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
                {isLoading ? (
                    <CommentItemSkeleton />
                ) : comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, px: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <Typography variant="body1" color="text.secondary">
                            No comments yet. Be the first to share your thoughts!
                        </Typography>
                    </Box>
                ) : (
                    comments.map((comment) => (
                        loadingComments.has(comment.id) ? (
                            <CommentItemSkeleton key={comment.id} />
                        ) : (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                isBookOwner={isBookOwner}
                                currentUserId={currentUser?._id || ''}
                                onDelete={() => setCommentToDelete(comment.id)}
                                onReaction={handleReaction}
                            />
                        )
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