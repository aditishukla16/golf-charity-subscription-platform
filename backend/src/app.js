import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import charityRoutes from './routes/charity.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import scoreRoutes from './routes/score.routes.js';
import winningsRoutes from './routes/winnings.routes.js';
import drawRoutes from './routes/draw.routes.js';
import adminRoutes from './routes/admin.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/winnings', winningsRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
