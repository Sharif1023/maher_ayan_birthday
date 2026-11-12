import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { hasAdminAccess, requireSiteAccess, signToken } from '../middleware/auth.js';
import { createMediaUrl, localMediaPath } from '../services/mediaStorage.js';
import { asyncHandler, HttpError } from '../utils/http.js';
import { existsSync } from 'node:fs';
import path from 'node:path';

const router = Router();
const accessCookie = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: '/',
} as const;

router.post('/access', asyncHandler(async (req, res) => {
  const input = z.object({ password: z.string().min(1).max(200) }).parse(req.body);
  const settings = await prisma.websiteSetting.findUnique({ where: { id: 1 } });
  if (!settings || settings.visibility !== 'PASSWORD_PROTECTED' || !settings.sitePasswordHash) {
    throw new HttpError(400, 'Password access is not enabled');
  }
  if (!(await bcrypt.compare(input.password, settings.sitePasswordHash))) throw new HttpError(401, 'That password is not correct');
  const token = signToken({ sub: 'site-visitor', type: 'site-access' }, '8h');
  res.cookie('ma_site_access', token, { ...accessCookie, maxAge: 8 * 60 * 60 * 1000 });
  res.json({ success: true });
}));

router.get('/bootstrap', requireSiteAccess, asyncHandler(async (_req, res) => {
  const [content, settings, media, timeline, wishes, memories] = await Promise.all([
    prisma.birthdayContent.findUnique({ where: { id: 1 } }),
    prisma.websiteSetting.findUnique({ where: { id: 1 } }),
    prisma.media.findMany({ where: { published: true }, orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }] }),
    prisma.timelineMilestone.findMany({ where: { published: true }, include: { media: { where: { published: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: [{ sortOrder: 'asc' }, { month: 'asc' }] }),
    prisma.birthdayWish.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 40 }),
    prisma.memory.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } }),
  ]);
  const mediaWithUrls = await Promise.all(media.map(async (item) => { const { storageKey, storageProvider, ...publicItem } = item; return { ...publicItem, url: await createMediaUrl(storageKey, storageProvider, item.id) }; }));
  const timelineWithUrls = await Promise.all(timeline.map(async (item) => ({
    ...item,
    media: await Promise.all(item.media.map(async (asset) => { const { storageKey, storageProvider, ...publicAsset } = asset; return { ...publicAsset, url: await createMediaUrl(storageKey, storageProvider, asset.id) }; })),
  })));
  const audio = mediaWithUrls.find((item) => item.type === 'AUDIO' && item.category === 'background-music');
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    content,
    settings: settings ? {
      visibility: settings.visibility,
      allowWishes: settings.allowWishes,
      backgroundMusicEnabled: settings.backgroundMusicEnabled,
      searchIndexingEnabled: settings.searchIndexingEnabled,
      siteTitle: settings.siteTitle,
      metaDescription: settings.metaDescription,
    } : null,
    media: mediaWithUrls,
    timeline: timelineWithUrls,
    wishes,
    memories,
    backgroundMusic: audio ?? null,
  });
}));

router.post('/wishes', requireSiteAccess, asyncHandler(async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(100),
    relationship: z.string().trim().max(100).optional().or(z.literal('')),
    message: z.string().trim().min(5).max(1200),
    website: z.string().max(0).optional(),
  }).parse(req.body);
  if (input.website) throw new HttpError(400, 'Invalid submission');
  const settings = await prisma.websiteSetting.findUnique({ where: { id: 1 } });
  if (!settings?.allowWishes) throw new HttpError(403, 'Birthday wishes are currently closed');
  const wish = await prisma.birthdayWish.create({ data: { name: input.name, relationship: input.relationship || null, message: input.message } });
  res.status(201).json({ success: true, message: 'Your wish was received and is awaiting approval.', wishId: wish.id });
}));

router.get('/media/:id', asyncHandler(async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media || (!media.published && !hasAdminAccess(req))) throw new HttpError(404, 'Media not found');
  if (!hasAdminAccess(req)) {
    const settings = await prisma.websiteSetting.findUnique({ where: { id: 1 } });
    if (settings?.visibility === 'PRIVATE') throw new HttpError(404, 'Media not found');
    if (settings?.visibility === 'PASSWORD_PROTECTED') {
      const token = req.cookies?.ma_site_access;
      const { verifyToken } = await import('../middleware/auth.js');
      const payload = verifyToken(token);
      if (!payload || payload.type !== 'site-access') throw new HttpError(401, 'Website access required');
    }
  }
  if (media.storageProvider === 's3') {
    const url = await createMediaUrl(media.storageKey, media.storageProvider, media.id);
    return res.redirect(url);
  }
  const filePath = localMediaPath(media.storageKey);
  if (!existsSync(filePath) || path.basename(filePath) !== path.basename(media.storageKey)) throw new HttpError(404, 'Media file not found');
  res.setHeader('Content-Type', media.mimeType);
  res.setHeader('Cache-Control', 'private, max-age=300');
  res.sendFile(filePath);
}));

export default router;
