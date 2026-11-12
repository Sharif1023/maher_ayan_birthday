import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { requireAdmin, signToken, type AuthRequest } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/http.js';

const router = Router();
const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: '/',
} as const;

router.post('/login', asyncHandler(async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(1).max(200) }).parse(req.body);
  const admin = await prisma.adminUser.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }
  const token = signToken({ sub: admin.id, type: 'admin' }, '12h');
  res.cookie('ma_admin', token, { ...cookieOptions, maxAge: 12 * 60 * 60 * 1000 });
  await prisma.adminActivityLog.create({ data: { adminId: admin.id, action: 'LOGIN', entity: 'AdminUser' } });
  res.json({ admin: { id: admin.id, email: admin.email } });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie('ma_admin', cookieOptions);
  res.json({ success: true });
});

router.get('/me', requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.adminId! }, select: { id: true, email: true, createdAt: true } });
  if (!admin) throw new HttpError(401, 'Administrator not found');
  res.json({ admin });
}));

router.post('/change-password', requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(12).max(200) }).parse(req.body);
  const admin = await prisma.adminUser.findUnique({ where: { id: req.adminId! } });
  if (!admin || !(await bcrypt.compare(input.currentPassword, admin.passwordHash))) throw new HttpError(400, 'Current password is incorrect');
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(input.newPassword, 12) } });
  res.json({ success: true, message: 'Password updated. Please sign in again.' });
  res.clearCookie('ma_admin', cookieOptions);
}));

export default router;
