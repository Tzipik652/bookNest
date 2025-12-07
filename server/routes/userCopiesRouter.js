import express from 'express';
const router = express.Router();
import userCopiesController from '../controllers/userCopiesController.js';
import { verifyJWT } from "../middleware/auth.js";

router.get('/', userCopiesController.getCopies);

router.get('/:id', userCopiesController.getCopyById);
router.get('/:id/userCopies', userCopiesController.getUserCopies);
router.get('/:id/bookCopies', userCopiesController.getBookCopies);

router.post('/', verifyJWT, userCopiesController.addCopy);

router.put('/:id/status', verifyJWT, userCopiesController.changeStatus);
router.put('/:id/location', verifyJWT, userCopiesController.changeLoanLocation);

router.delete('/:id', verifyJWT, userCopiesController.deleteCopy);

export default router;
