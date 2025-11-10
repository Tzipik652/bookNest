// controllers/favoriteController.js
// import * as favoriteModel from "../models/favoriteModel.js";

/**
 * Toggle favorite (add/remove)
 */
export async function toggleFavorite(req, res) {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId)
      return res.status(400).json({ error: "userId and bookId are required" });

    const alreadyFavorite = await favoriteModel.isFavorite(userId, bookId);

    if (alreadyFavorite) {
      await favoriteModel.removeFavorite(userId, bookId);
      return res.json({ success: true, message: "Removed from favorites" });
    } else {
      await favoriteModel.addFavorite(userId, bookId);
      return res.json({ success: true, message: "Added to favorites" });
    }
  } catch (error) {
    console.error("toggleFavorite error:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
}

/**
 * Check if a book is a favorite for a given user
 */
export async function isFavorite(req, res) {
  try {
    const { userId, bookId } = req.params;
    if (!userId || !bookId)
      return res.status(400).json({ error: "userId and bookId are required" });

    const result = await favoriteModel.isFavorite(userId, bookId);
    res.json({ favorite: result });
  } catch (error) {
    console.error("isFavorite error:", error);
    res.status(500).json({ error: "Failed to check favorite status" });
  }
}

/**
 * Get all favorite books for a user
 */
export async function getFavorites(req, res) {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ error: "userId is required" });

    const favoriteBooks = await favoriteModel.getFavoriteBooks(userId);
    res.json(favoriteBooks);
  } catch (error) {
    console.error("getFavorites error:", error);
    res.status(500).json({ error: "Failed to fetch favorite books" });
  }
}

/**
 * Get book likes
 */
export async function getBookLikes(req, res) {
  try {
    const { bookId } = req.params;
    if (!bookId)
      return res.status(400).json({ error: "bookId is required" });

    const count = await favoriteModel.countBookFavorites(bookId);
    res.json({bookId, favoritesCount: count});
  } catch (error) {
    console.error("getBookLikes error:", error);
    res.status(500).json({ error: "Failed to get book favorites count" });
  }
}
