import { Router } from 'express';
import { createScore, listMyScores } from '../controllers/scores.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireActiveSubscription } from '../middleware/subscription.middleware.js';

const router = Router();

router.get('/me', authenticate, requireActiveSubscription, listMyScores);
router.post('/me', authenticate, requireActiveSubscription, createScore);

export default router;
