import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set — Stripe features will fail');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-01-28.clover',
});

export default stripe;

/** Map tier + interval to Stripe Price ID */
export function getPriceId(tier: 'stellar' | 'cosmic', interval: 'month' | 'year'): string {
  const map: Record<string, string | undefined> = {
    'stellar-month': process.env.STRIPE_PRICE_STELLAR_MONTHLY,
    'stellar-year': process.env.STRIPE_PRICE_STELLAR_ANNUAL,
    'cosmic-month': process.env.STRIPE_PRICE_COSMIC_MONTHLY,
    'cosmic-year': process.env.STRIPE_PRICE_COSMIC_ANNUAL,
  };
  const id = map[`${tier}-${interval}`];
  if (!id) throw new Error(`No price configured for ${tier}/${interval}`);
  return id;
}
