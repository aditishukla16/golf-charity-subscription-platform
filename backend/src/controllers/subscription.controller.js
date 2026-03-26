import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';

const planToStripePrice = {
  monthly: env.stripePriceMonthly,
  yearly: env.stripePriceYearly
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'plan must be monthly or yearly.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: planToStripePrice[plan], quantity: 1 }],
      success_url: env.stripeSuccessUrl,
      cancel_url: env.stripeCancelUrl,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        plan
      }
    });

    return res.status(201).json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    return next(err);
  }
};

export const getMySubscription = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return res.json({ subscription: data || null });
  } catch (err) {
    return next(err);
  }
};
