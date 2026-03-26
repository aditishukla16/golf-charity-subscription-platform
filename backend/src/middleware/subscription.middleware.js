import { supabase } from '../config/supabase.js';

const allowed = new Set(['active', 'trialing']);

export const requireActiveSubscription = async (req, res, next) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ message: 'Failed to validate subscription status.' });
  }

  if (!data || !allowed.has(data.status)) {
    return res.status(402).json({ message: 'Active subscription required.' });
  }

  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return res.status(402).json({ message: 'Subscription period has ended.' });
  }

  req.subscription = data;
  return next();
};
