// routes/authRoutes.js
import express from 'express';
import { register, login, googleLogin, getAllUsers } from '../controllers/userController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/',verifyJWT, getAllUsers);

export default router;
