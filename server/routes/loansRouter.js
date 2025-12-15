import express from 'express';
const router = express.Router();
import loansController from '../controllers/loansController.js';
import { verifyJWT } from "../middleware/auth.js";

router.get('/', loansController.getLoans);

router.get('/:loanId', loansController.getLoanById);
router.get('/:userId/borrower', loansController.getLoansByBorrowerId);
router.get('/:userId/owner', loansController.getLoansByUserCopyId);
router.get('/:userCopyId/active-loan-for-copy', loansController.getActiveLoanForCopy);

router.post('/request', verifyJWT, loansController.addLoan);

router.put('/:loanId/status', verifyJWT, loansController.changeStatus);

router.put('/:loanId/loan-start-date', verifyJWT, loansController.updateLoanStartDate);
router.put('/:loanId/due-date', verifyJWT, loansController.updateDueDate);
router.put('/:loanId/return-date', verifyJWT, loansController.updateReturnDate);

router.delete('/:loanId', verifyJWT, loansController.deleteLoan);

export default router;
