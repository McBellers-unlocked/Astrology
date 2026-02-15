import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set — email features will fail');
}

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export default resend;

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Stellara <noreply@stellara.co>';
