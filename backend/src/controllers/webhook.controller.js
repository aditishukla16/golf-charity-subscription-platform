import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';

const upsertSubscription = async ({ userId, stripeSubscriptionId, stripeCustomerId, status, planType, amount, currentPeriodEnd }) => {
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
      status,
      plan_type: planType,
      amount,
      currency: 'usd',
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString()
    }, { onConflict: 'stripe_subscription_id' });
};

const handleCheckoutCompleted = async (session) => {
  const userId = session.metadata?.userId || session.client_reference_id;
  if (!userId || !session.subscription) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
  const amount = (stripeSubscription.items.data[0]?.price?.unit_amount || 0) / 100;

  await upsertSubscription({
    userId,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId: String(stripeSubscription.customer),
    status: stripeSubscription.status,
    planType: session.metadata?.plan || 'monthly',
    amount,
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString()
  });
};

const handleSubscriptionUpdated = async (subscription) => {
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('user_id, plan_type')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  if (!existing?.user_id) return;

  const amount = (subscription.items.data[0]?.price?.unit_amount || 0) / 100;

  await upsertSubscription({
    userId: existing.user_id,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: String(subscription.customer),
    status: subscription.status,
    planType: existing.plan_type,
    amount,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
  });
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event.data.object);
        break;
      default:
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    return next(err);
  }
};
