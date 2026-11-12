import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

export type TokenPayload = { sub: string; type: 'admin' | 'site-access' };
export type AuthRequest = Request & { adminId?: string };

export function signToken(payload: TokenPayload, expiresIn: jwt.SignOptions['expiresIn']) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
}

export function verifyToken(token?: string): TokenPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  const payload = verifyToken(req.cookies?.ma_admin);
  if (!payload || payload.type !== 'admin') return next(new HttpError(401, 'Administrator authentication required'));
  req.adminId = payload.sub;
  next();
}

export function hasAdminAccess(req: Request) {
  const payload = verifyToken(req.cookies?.ma_admin);
  return Boolean(payload && payload.type === 'admin');
}

export async function requireSiteAccess(req: Request, _res: Response, next: NextFunction) {
  try {
    if (hasAdminAccess(req)) return next();
    const { prisma } = await import('../lib/prisma.js');
    const settings = await prisma.websiteSetting.findUnique({ where: { id: 1 } });
    if (!settings || settings.visibility === 'PUBLIC') return next();
    if (settings.visibility === 'PRIVATE') return next(new HttpError(404, 'This memory website is private'));
    const payload = verifyToken(req.cookies?.ma_site_access);
    if (!payload || payload.type !== 'site-access') return next(new HttpError(401, 'This website is password protected'));
    next();
  } catch (error) {
    next(error);
  }
}
