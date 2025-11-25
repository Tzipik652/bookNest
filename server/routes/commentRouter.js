// routes/commentRoutes.js
import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  updateComment,
  getCommentById,
  getAllComments
} from "../controllers/commentController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.get("/:bookId", getComments);
router.post("/", verifyJWT, addComment);
router.delete("/:commentId", verifyJWT, deleteComment);
router.put("/:commentId", verifyJWT, updateComment);
router.get('/single/:commentId', getCommentById);
router.get('/', verifyJWT, getAllComments);

export default router;