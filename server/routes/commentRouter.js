// routes/commentRoutes.js (מעודכן - בלי reactions)
import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  getCommentById
} from "../controllers/commentController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.get("/:bookId", getComments);
router.post("/", verifyJWT, addComment);
router.delete("/:commentId", verifyJWT, deleteComment);
router.get('/single/:commentId', getCommentById);

export default router;