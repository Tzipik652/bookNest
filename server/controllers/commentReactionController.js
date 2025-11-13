// controllers/commentReactionController.js
import * as CommentReactionModel from "../models/commentReactionModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

/**
 * הוספה/הסרה/עדכון של reaction
 */
export const toggleReaction = catchAsync(async (req, res, next) => {
  const { commentId, reactionType } = req.body;
  const user = req.user;

  if (!user) {
    throw new AppError("Must be logged in to react", 401);
  }

  if (!commentId || !reactionType) {
    throw new AppError("Comment ID and reaction type are required", 400);
  }

  // בדיקה שסוג ה-reaction תקין
  const validReactions = ["like", "dislike", "happy", "angry"];
  if (!validReactions.includes(reactionType)) {
    throw new AppError("Invalid reaction type", 400);
  }

  const result = await CommentReactionModel.toggleReaction(
    commentId,
    user._id,
    reactionType
  );

  res.status(200).json(result);
});

/**
 * קבלת כל ה-reactions לתגובה מסוימת
 */
export const getReactionsByComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new AppError("Comment ID is required", 400);
  }

  const reactions = await CommentReactionModel.findByCommentId(commentId);
  const counts = await CommentReactionModel.getReactionCounts(commentId);

  res.status(200).json({
    reactions,
    counts
  });
});

/**
 * קבלת ה-reaction של משתמש ספציפי על תגובה
 */
export const getUserReactionOnComment = catchAsync(async (req, res, next) => {
  const { commentId, userId } = req.params;

  if (!commentId || !userId) {
    throw new AppError("Comment ID and User ID are required", 400);
  }

  const userReaction = await CommentReactionModel.findUserReaction(
    commentId,
    userId
  );

  res.status(200).json({
    commentId,
    userId,
    reaction: userReaction
  });
});