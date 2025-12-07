import express from 'express';
const router = express.Router();
import loansController from '../controllers/loansController.js';
import { verifyJWT } from "../middleware/auth.js";

router.get('/', loansController.getLoans);

router.get('/:id', loansController.getLoanById);
router.get('/:id/borrower', loansController.getLoansByBorrowerId);
router.get('/:id/userCopy', loansController.getLoansByUserCopyId);

router.post('/', verifyJWT, loansController.addLoan);

router.put('/:id/status', verifyJWT, loansController.changeStatus);

router.put('/:id/loanStartDate', verifyJWT, loansController.updateLoanStartDate);
router.put('/:id/dueDate', verifyJWT, loansController.updateDueDate);
router.put('/:id/returnDate', verifyJWT, loansController.updateReturnDate);

router.delete('/:id', verifyJWT, loansController.deleteLoan);

export default router;
