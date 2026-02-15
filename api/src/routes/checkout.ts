import { Router } from 'express';
import db from '../db.js';
import stripe, { getPriceId } from '../lib/stripe.js';
import { requireAuth } from '../middleware/auth.js';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://stellera.co';

const router = Router();

/* ----------------------------------------------------------------
   POST /checkout/create-session
   ---------------------------------------------------------------- */
router.post('/create-session', requireAuth, async (req, res) => {
  try {
    const { tier, interval } = req.body as {
      tier?: 'stellar' | 'cosmic';
      interval?: 'month' | 'year';
    };

    if (!tier || !['stellar', 'cosmic'].includes(tier)) {
      res.status(400).json({ error: 'tier must be "stellar" or "cosmic"' });
      return;
    }
    if (!interval || !['month', 'year'].includes(interval)) {
      res.status(400).json({ error: 'interval must be "month" or "year"' });
      return;
    }

    const priceId = getPriceId(tier, interval);
    const userId = req.user!.userId;

    // Get or create Stripe customer
    const user = db
      .prepare('SELECT email, name, stripe_customer_id FROM users WHERE id = ?')
      .get(userId) as { email: string; name: string; stripe_customer_id: string | null } | undefined;

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { stellara_user_id: userId },
      });
      customerId = customer.id;
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, userId);
    }

    // Create checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { stellara_user_id: userId, tier },
      },
      success_url: `${FRONTEND_URL}/pricing?success=1`,
      cancel_url: `${FRONTEND_URL}/pricing?canceled=1`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
