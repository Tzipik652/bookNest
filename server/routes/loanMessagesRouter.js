import express from 'express';
const router = express.Router();
import loansMessagesController from '../controllers/loanMessagesController.js';
import { verifyJWT } from "../middleware/auth.js";


router.get('/:loanId/chat-messages', loansMessagesController.getChatMessages);

router.post('/:loanId/chat-messages', verifyJWT, loansMessagesController.sendChatMessage);

export default router;
