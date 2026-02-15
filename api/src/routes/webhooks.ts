import { Router, type Request, type Response } from 'express';
import stripe from '../lib/stripe.js';
import db from '../db.js';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

const router = Router();

/* ----------------------------------------------------------------
   POST /webhooks/stripe
   NOTE: This route MUST receive the raw body (not JSON-parsed).
   The raw body middleware is configured in index.ts.
   ---------------------------------------------------------------- */
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;

  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const tier = subscription.metadata?.tier ?? 'stellar';
          const status = subscription.status; // 'active' | 'trialing'

          db.prepare(
            `UPDATE users
             SET subscription_tier = ?, subscription_status = ?, stripe_customer_id = ?
             WHERE stripe_customer_id = ?`,
          ).run(tier, status, customerId, customerId);

          console.log(`Checkout complete: customer=${customerId} tier=${tier} status=${status}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const tier = subscription.metadata?.tier ?? 'stellar';
        const status = subscription.status;
        const endDate = subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toISOString()
          : null;

        db.prepare(
          `UPDATE users
           SET subscription_tier = ?, subscription_status = ?, subscription_end_date = ?
           WHERE stripe_customer_id = ?`,
        ).run(tier, status, endDate, customerId);

        console.log(`Subscription updated: customer=${customerId} tier=${tier} status=${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        db.prepare(
          `UPDATE users
           SET subscription_tier = 'free', subscription_status = 'canceled'
           WHERE stripe_customer_id = ?`,
        ).run(customerId);

        console.log(`Subscription canceled: customer=${customerId}`);
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
