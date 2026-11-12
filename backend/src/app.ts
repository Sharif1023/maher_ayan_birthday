import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { HttpError } from './utils/http.js';

export const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  const hasCookieSession = Boolean(req.cookies?.ma_admin || req.cookies?.ma_site_access);
  if (unsafeMethod && hasCookieSession && req.get('origin') !== env.frontendOrigin) {
    return res.status(403).json({ error: 'Request origin could not be verified.' });
  }
  next();
});
app.use('/api/public/access', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/public/wishes', rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'maher-ayan-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use((_req, _res, next) => next(new HttpError(404, 'Route not found')));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') return res.status(400).json({ error: 'Please check the submitted information.' });
  if (error && typeof error === 'object' && 'code' in error && error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'The selected file is too large.' });
  console.error(error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});
