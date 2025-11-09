// routes/authRoutes.js
import express from 'express';
import { register, login, googleLogin } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// router.get('/favorites', getFavorites);

export default router;
