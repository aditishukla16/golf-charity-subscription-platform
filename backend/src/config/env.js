import dotenv from 'dotenv';

dotenv.config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_MONTHLY',
  'STRIPE_PRICE_YEARLY',
  'STRIPE_SUCCESS_URL',
  'STRIPE_CANCEL_URL'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceMonthly: process.env.STRIPE_PRICE_MONTHLY,
  stripePriceYearly: process.env.STRIPE_PRICE_YEARLY,
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL,
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL,
  drawScheduleCron: process.env.DRAW_SCHEDULE_CRON || '0 2 1 * *',
  drawTimezone: process.env.DRAW_TIMEZONE || 'UTC',
  defaultJackpotSeed: Number(process.env.DEFAULT_JACKPOT_SEED || 1000),
  weightedDrawPower: Number(process.env.WEIGHTED_DRAW_POWER || 1.2)
};
