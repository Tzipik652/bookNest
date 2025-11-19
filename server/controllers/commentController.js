// controllers/commentController.js (מעודכן - בלי reactions)
import * as CommentModel from "../models/commentModel.js";
import * as BookModel from "../models/bookModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getComments = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  
  if (!bookId) {
    throw new AppError("Book ID is required", 400);
  }

  const comments = await CommentModel.findByBookId(bookId);
  res.status(200).json(comments);
});

export const getCommentById = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  
  if (!commentId) {
    throw new AppError("Comment ID is required", 400);
  }

  const comment = await CommentModel.findById(commentId);
  
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  res.status(200).json(comment);
});

export const addComment = catchAsync(async (req, res, next) => {
  const { bookId, text } = req.body;
  const user = req.user;

  if (!user) {
    throw new AppError("Must be logged in to add comment", 401);
  }

  if (!bookId || !text) {
    throw new AppError("Book ID and text are required", 400);
  }

  const newComment = await CommentModel.create({
    bookId: bookId,
    userId: user._id,
    text: text,
  });

  res.status(201).json(newComment);
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const user = req.user;

  if (!user) {
    throw new AppError("Must be logged in to delete comment", 401);
  }

  if (!commentId) {
    throw new AppError("Comment ID is required", 400);
  }

  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  const book = await BookModel.findById(comment.book_id);
  if (!book) {
    throw new AppError("Book not found", 404);
  }

  if (comment.user_id !== user._id && book.user_id !== user._id && user.role !== 'admin') {
    throw new AppError("Unauthorized to delete this comment", 403);
  }

  const success = await CommentModel.remove(commentId);
  res.status(200).json({ success });
});
export const getAllComments = catchAsync(async (req, res, next) => {
  const user= req.user;

  if (!user || user.role !== 'admin') {
    throw new AppError("Unauthorized: Admin access required", 403);
  }
  const comments = await CommentModel.findAll();
  res.status(200).json(comments);
});