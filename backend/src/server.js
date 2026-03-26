import { app } from './app.js';
import { env } from './config/env.js';
import { startDrawScheduler } from './services/draw.scheduler.js';

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${env.port}`);
});

startDrawScheduler();
