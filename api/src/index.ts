import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join } from 'path';

import authRoutes from './routes/auth.js';
import emailRoutes from './routes/email.js';
import checkoutRoutes from './routes/checkout.js';
import webhookRoutes from './routes/webhooks.js';
import horoscopeRoutes from './routes/horoscope.js';
import chartRoutes from './routes/charts.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://stellera.co';

// Security headers — relax policies that conflict with cross-origin API calls
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
  }),
);

// CORS — only allow the Stellara frontend
app.use(
  cors({
    origin: [FRONTEND_URL, FRONTEND_URL.replace('://', '://www.'), 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Stripe webhooks need the raw body — mount BEFORE json parser
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// JSON body parser for all other routes (with size limit)
app.use(express.json({ limit: '1mb' }));

// Global rate limiter — 100 requests per 15min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// Stricter rate limits for sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many subscribe attempts. Please try again later.' },
});

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/email', emailLimiter, emailRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/horoscopes', horoscopeRoutes);
app.use('/charts', chartRoutes);
app.use('/admin', adminRoutes);

// Serve temporary social images for Instagram API (it fetches images by URL)
app.use('/social-images', express.static(join(process.cwd(), 'public', 'social-images')));

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'stellara-api', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Stellara API running on port ${PORT}`);
  console.log(`CORS origin: ${FRONTEND_URL}`);
});
