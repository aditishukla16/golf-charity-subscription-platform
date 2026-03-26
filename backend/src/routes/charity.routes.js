import { Router } from 'express';
import { listCharities, updateMyCharitySelection } from '../controllers/charity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', listCharities);
router.put('/me/selection', authenticate, updateMyCharitySelection);

export default router;
