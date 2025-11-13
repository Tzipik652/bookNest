// routes/commentRoutes.js (מעודכן - בלי reactions)
import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/commentController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.get("/:bookId", getComments);
router.post("/", verifyJWT, addComment);
router.delete("/:commentId", verifyJWT, deleteComment);

export default router;