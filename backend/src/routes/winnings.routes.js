import { Router } from 'express';
import { listMyWinnings, submitWinnerProof } from '../controllers/winnings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authenticate, listMyWinnings);
router.post('/proofs', authenticate, submitWinnerProof);

export default router;
