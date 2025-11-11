// // controllers/favoriteController.js
// import favoritesModel from "../models/favoritesModel.js";

// /**
//  * Toggle favorite (add/remove)
//  */
// export async function toggleFavorite(req, res) {
//   try {
//     const userId = req.user._id;
//     const { bookId } = req.body;
//     if (!userId || !bookId)
//       return res.status(400).json({ error: "userId and bookId are required" });

//     const alreadyFavorite = await favoritesModel.isFavorite(userId, bookId);

//     if (alreadyFavorite) {
//       await favoritesModel.removeFavorite(userId, bookId);
//       return res.json({ success: true, message: "Removed from favorites" });
//     } else {
//       await favoritesModel.addFavorite(userId, bookId);
//       return res.json({ success: true, message: "Added to favorites" });
//     }
//   } catch (error) {
//     console.error("toggleFavorite error:", error);
//     res.status(500).json({ error: "Failed to toggle favorite" });
//   }
// }

// /**
//  * Check if a book is a favorite for a given user
//  */
// export async function isFavorite(req, res) {
//   try {
//     const userId = req.user._id;
//     const { bookId } = req.params;
//     if (!userId || !bookId)
//       return res.status(400).json({ error: "userId and bookId are required" });

//     const result = await favoritesModel.isFavorite(userId, bookId);
//     res.json({ favorite: result });
//   } catch (error) {
//     console.error("isFavorite error:", error);
//     res.status(500).json({ error: "Failed to check favorite status" });
//   }
// }

// /**
//  * Get all favorite books for a user
//  */
// export async function getFavorites(req, res) {
//   try {
//     const userId = req.user._id;
//     if (!userId)
//       return res.status(400).json({ error: "userId is required" });

//     const favoriteBooks = await favoritesModel.getFavoriteBooks(userId);
//     res.json(favoriteBooks);
//   } catch (error) {
//     console.error("getFavorites error:", error);
//     res.status(500).json({ error: "Failed to fetch favorite books" });
//   }
// }

// /**
//  * Get book likes
//  */
// export async function getBookLikes(req, res) {
//   try {
//     const { bookId } = req.params;
//     if (!bookId)
//       return res.status(400).json({ error: "bookId is required" });

//     const count = await favoritesModel.countBookFavorites(bookId);
//     res.json({bookId, favoritesCount: count});
//   } catch (error) {
//     console.error("getBookLikes error:", error);
//     res.status(500).json({ error: "Failed to get book favorites count" });
//   }
// }
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import favoritesModel from "../models/favoritesModel.js";

/**
 * הוספה או הסרה ממועדפים (Toggle)
 */
export const toggleFavorite = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bookId } = req.body;

  if (!userId || !bookId) {
    throw new AppError("userId and bookId are required", 400);
  }

  const alreadyFavorite = await favoritesModel.isFavorite(userId, bookId);

  if (alreadyFavorite) {
    await favoritesModel.removeFavorite(userId, bookId);
    res.status(200).json({ success: true, message: "Removed from favorites" });
  } else {
    await favoritesModel.addFavorite(userId, bookId);
    res.status(201).json({ success: true, message: "Added to favorites" });
  }
});

/**
 * בדיקה אם ספר מסומן כמועדף
 */
export const isFavorite = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bookId } = req.params;

  if (!userId || !bookId) {
    throw new AppError("userId and bookId are required", 400);
  }

  const favorite = await favoritesModel.isFavorite(userId, bookId);
  res.status(200).json({ favorite });
});

/**
 * כל הספרים במועדפים של המשתמש
 */
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
/**
 * מספר המועדפים של ספר מסוים
 */
export const getBookLikes = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;

  if (!bookId) {
    throw new AppError("bookId is required", 400);
  }

  const count = await favoritesModel.countBookFavorites(bookId);
  res.status(200).json({ bookId, favoritesCount: count });
});
