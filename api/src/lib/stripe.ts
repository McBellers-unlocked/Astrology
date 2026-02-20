import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

export default new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const real = getStripe();
    const val = Reflect.get(real, prop, receiver);
    return typeof val === 'function' ? val.bind(real) : val;
  },
});

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
