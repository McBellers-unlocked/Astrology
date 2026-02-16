import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set — email features will be disabled');
}

// Only create a real client if the key exists; otherwise use a stub
const resend = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : ({
      emails: {
        send: async (payload: { to?: string; subject?: string }) => {
          console.warn(`Email SKIPPED (no RESEND_API_KEY): to=${payload.to}, subject="${payload.subject}"`);
          return { data: null, error: null };
        },
      },
    } as unknown as Resend);

export default resend;

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Stellara <noreply@stellera.co>';
