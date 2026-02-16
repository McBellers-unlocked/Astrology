import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import emailRoutes from './routes/email.js';
import checkoutRoutes from './routes/checkout.js';
import webhookRoutes from './routes/webhooks.js';
import horoscopeRoutes from './routes/horoscope.js';
import chartRoutes from './routes/charts.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://stellera.co';

// Security headers
app.use(helmet());

// CORS — only allow the Stellara frontend
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Stripe webhooks need the raw body — mount BEFORE json parser
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// JSON body parser for all other routes
app.use(express.json());

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/email', emailRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/horoscopes', horoscopeRoutes);
app.use('/charts', chartRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'stellara-api', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Stellara API running on port ${PORT}`);
  console.log(`CORS origin: ${FRONTEND_URL}`);
});
