import { Router } from 'express';
import { createCheckoutSession, getMySubscription } from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authenticate, getMySubscription);
router.post('/checkout', authenticate, createCheckoutSession);

export default router;
