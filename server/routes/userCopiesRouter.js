import express from 'express';
const router = express.Router();
import userCopiesController from '../controllers/userCopiesController.js';
import { verifyJWT } from "../middleware/auth.js";

router.get('/', userCopiesController.getCopies);

router.get('/:copyId', userCopiesController.getCopyById);
router.get('/:userId/user-copies', userCopiesController.getUserCopies);
router.get('/:bookId/book-copies', userCopiesController.getBookCopies);
router.get('/:bookId/available-book-copies', userCopiesController.getAvailableCopiesForBook);
router.get('/book-copy/:userId/:bookId', userCopiesController.getBookCopyByUserId);

router.post('/', verifyJWT, userCopiesController.addCopy);

router.put('/:copyId/status', verifyJWT, userCopiesController.changeStatus);
router.put('/:copyId/location', verifyJWT, userCopiesController.changeLoanLocation);

router.delete('/:copyId', verifyJWT, userCopiesController.deleteCopy);

export default router;
