import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import favoritesModel from "../models/favoritesModel.js";
import { invalidateRecommendationsCache } from '../controllers/bookController.js'

export const toggleFavorite = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bookId } = req.body;

  if (!userId || !bookId) {
    throw new AppError("userId and bookId are required", 400);
  }

  invalidateRecommendationsCache(userId);

  const alreadyFavorite = await favoritesModel.isFavorite(userId, bookId);

  if (alreadyFavorite) {
    await favoritesModel.removeFavorite(userId, bookId);
    res.status(200).json({ success: true, message: "Removed from favorites" });
  } else {
    await favoritesModel.addFavorite(userId, bookId);
    res.status(201).json({ success: true, message: "Added to favorites" });
  }
});

export const isFavorite = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bookId } = req.params;

  if (!userId || !bookId) {
    throw new AppError("userId and bookId are required", 400);
  }

  const favorite = await favoritesModel.isFavorite(userId, bookId);
  res.status(200).json({ favorite });
});


export const getFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  try {
    const favoriteBooks = await favoritesModel.getFavoriteBooks(userId);
    res.status(200).json(favoriteBooks);
  } catch (error) {
    console.error("getFavorites error:", error);
    throw new AppError("Failed to fetch favorite books", 500);
  }
});

export const getBookLikes = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;

  if (!bookId) {
    throw new AppError("bookId is required", 400);
  }

  const count = await favoritesModel.countBookFavorites(bookId);
  res.status(200).json({ bookId, favoritesCount: count });
});
