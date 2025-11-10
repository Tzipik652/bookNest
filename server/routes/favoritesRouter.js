import express from "express";
import {verifyJWT} from '../middleware/auth.js';
import { getBookLikes, getFavorites, isFavorite, toggleFavorite } from '../controllers/favoritesController.js';

const router = express.Router();

router.get("/", verifyJWT, getFavorites);          // get all favorites
router.post("/toggle", verifyJWT, toggleFavorite);        // add/remove favorite
router.get("/count/:bookId", getBookLikes);
router.get("/:bookId", verifyJWT, isFavorite);    // check single favorite
export default router;
