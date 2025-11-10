import express from "express";
// import {
//   toggleFavorite,
//   isFavorite,
//   getFavorites,
//   getBookLikes
// } from "../controllers/favoritesConroller";
import {verifyJWT} from '../middleware/auth.js';
import { getBookLikes, getFavorites, isFavorite, toggleFavorite } from '../controllers/favoritesConroller.js';

const router = express.Router();

router.post("/toggle", verifyJWT, toggleFavorite);        // add/remove favorite
router.get("/:userId/:bookId", verifyJWT, isFavorite);    // check single favorite
router.get("/:userId", verifyJWT, getFavorites);          // get all favorites
router.get("/count/:bookId", verifyJWT, getBookLikes);
export default router;
