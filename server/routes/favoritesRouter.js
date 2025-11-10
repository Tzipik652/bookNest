import express from "express";
import {
  toggleFavorite,
  isFavorite,
  getFavorites,
  getBookLikes
} from "../controllers/favoritesConroller";
import {verifyJWT} from '../middleware/auth';

const router = express.Router();

router.post("/toggle", verifyJWT, toggleFavorite);        // add/remove favorite
router.get("/:userId/:bookId", verifyJWT, isFavorite);    // check single favorite
router.get("/:userId", verifyJWT, getFavorites);          // get all favorites
router.get("/count/:bookId", getBookLikes);
export default router;
