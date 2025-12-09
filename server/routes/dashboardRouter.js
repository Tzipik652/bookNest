import express from "express";
import {verifyJWT} from '../middleware/auth.js';
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();
router.get('/stats',verifyJWT,getDashboardStats)
export default router;