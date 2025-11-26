// routes/commentReactionRoutes.js
import express from "express";
import {
  toggleReaction,
  getReactionsByComment,
  getUserReactionOnComment,
} from "../controllers/commentReactionController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.get("/:commentId", getReactionsByComment);

router.get("/user/:userId/:commentId", getUserReactionOnComment);

router.post("/toggle", verifyJWT, toggleReaction);

export default router;