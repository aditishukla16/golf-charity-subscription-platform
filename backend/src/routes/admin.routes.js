import { Router } from 'express';
import {
  analyticsSummary,
  listUsers,
  markPayoutCompleted,
  updateUser,
  verifyWinnerProof
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));
router.get('/users', listUsers);
router.patch('/users/:userId', updateUser);
router.patch('/winner-proofs/:proofId', verifyWinnerProof);
router.patch('/payouts/:payoutId/complete', markPayoutCompleted);
router.get('/analytics/summary', analyticsSummary);

export default router;
