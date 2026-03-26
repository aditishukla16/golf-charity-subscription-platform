import { Router } from 'express';
import { listPublishedDraws, publishDrawResult, runDraw } from '../controllers/draw.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/published', listPublishedDraws);
router.post('/run', authenticate, requireRole('admin'), runDraw);
router.patch('/:drawResultId/publish', authenticate, requireRole('admin'), publishDrawResult);

export default router;
