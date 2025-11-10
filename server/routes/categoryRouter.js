import express from 'express';
import { getAllCategories } from '../controllers/categoryController.js';

const router = express.Router();

// GET /api/categories
router.get('/', getAllCategories);

export default router;