import cron from 'node-cron';
import { env } from '../config/env.js';
import { runDraw } from '../controllers/draw.controller.js';

const mockReq = { body: { mode: 'weighted' }, user: { role: 'admin', id: 'system-scheduler' } };
const mockRes = {
  status() {
    return this;
  },
  json(payload) {
    return payload;
  }
};

export const startDrawScheduler = () => {
  cron.schedule(env.drawScheduleCron, async () => {
    try {
      await runDraw(mockReq, mockRes, (error) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Monthly draw scheduler failed:', error.message);
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Monthly draw scheduler crashed:', error.message);
    }
  }, { timezone: env.drawTimezone });
};
