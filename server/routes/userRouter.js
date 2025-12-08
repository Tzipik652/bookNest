// routes/authRoutes.js
import express from 'express';
import { register, login, googleLogin, getAllUsers, update, deleteUser, getPaginatedUsers, searchUsers } from '../controllers/userController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/',verifyJWT, getAllUsers);
router.put('/:id',verifyJWT, update);
router.delete('/:id',verifyJWT, deleteUser);
router.get('/paginated', verifyJWT, getPaginatedUsers);
router.get('/search', verifyJWT, searchUsers);

export default router;
