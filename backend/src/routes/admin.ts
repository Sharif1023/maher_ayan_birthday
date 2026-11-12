import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { fileTypeFromFile } from 'file-type';
import { unlink } from 'node:fs/promises';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { createMediaUrl, persistUploadedFile, removeStoredFile, uploadLimitFor } from '../services/mediaStorage.js';
import { asyncHandler, HttpError } from '../utils/http.js';

const router = Router();
router.use(requireAdmin);

async function logAction(adminId: string, action: string, entity: string, entityId?: string) {
  await prisma.adminActivityLog.create({ data: { adminId, action, entity, entityId } });
}

router.get('/overview', asyncHandler(async (_req, res) => {
  const [photos, videos, memories, milestones, pendingWishes, approvedWishes, recentUploads] = await Promise.all([
    prisma.media.count({ where: { type: 'IMAGE' } }),
    prisma.media.count({ where: { type: 'VIDEO' } }),
    prisma.memory.count(),
    prisma.timelineMilestone.count(),
    prisma.birthdayWish.count({ where: { status: 'PENDING' } }),
    prisma.birthdayWish.count({ where: { status: 'APPROVED' } }),
    prisma.media.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, type: true, createdAt: true } }),
  ]);
  res.json({ photos, videos, memories, milestones, pendingWishes, approvedWishes, recentUploads });
}));

router.get('/media', asyncHandler(async (req, res) => {
  const type = typeof req.query.type === 'string' ? req.query.type.toUpperCase() : undefined;
  const items = await prisma.media.findMany({ where: type && ['IMAGE', 'VIDEO', 'AUDIO'].includes(type) ? { type: type as 'IMAGE' | 'VIDEO' | 'AUDIO' } : undefined, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  res.json({ items: await Promise.all(items.map(async (item) => ({ ...item, url: await createMediaUrl(item.storageKey, item.storageProvider, item.id) }))) });
}));

router.post('/media', upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  const file = req.file;
  if (!file) throw new HttpError(400, 'Choose a file to upload');
  let stored: { storageKey: string; storageProvider: string } | null = null;
  try {
    const type = file.mimetype.startsWith('image/') ? 'IMAGE' : file.mimetype.startsWith('video/') ? 'VIDEO' : 'AUDIO';
    const detected = await fileTypeFromFile(file.path);
    const allowedDetected = type === 'IMAGE' ? ['image/jpeg', 'image/png', 'image/webp'] : type === 'VIDEO' ? ['video/mp4', 'video/webm'] : ['audio/mpeg', 'audio/mp4', 'audio/ogg'];
    if (!detected || !allowedDetected.includes(detected.mime)) throw new HttpError(415, 'The uploaded file content does not match an allowed media type');
    if (file.size > uploadLimitFor(type)) throw new HttpError(413, `File exceeds the ${type.toLowerCase()} upload limit`);
    const meta = z.object({
      title: z.string().max(191).optional(), caption: z.string().max(5000).optional(),
      description: z.string().max(10000).optional(), category: z.string().max(100).optional(),
      dateTaken: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
      featured: z.string().optional(), timelineMilestoneId: z.string().optional(),
    }).parse(req.body);
    stored = await persistUploadedFile(file);
    const item = await prisma.media.create({ data: {
      type, title: meta.title || file.originalname, caption: meta.caption || '',
      description: meta.description || null, category: meta.category || null,
      storageKey: stored.storageKey, storageProvider: stored.storageProvider,
      mimeType: file.mimetype, sizeBytes: file.size, originalName: file.originalname.slice(0, 255),
      featured: meta.featured === 'true', timelineMilestoneId: meta.timelineMilestoneId || null,
      dateTaken: meta.dateTaken ? new Date(`${meta.dateTaken}T00:00:00.000Z`) : null,
    } });
    await logAction(req.adminId!, 'UPLOAD', 'Media', item.id);
    res.status(201).json({ item: { ...item, url: await createMediaUrl(item.storageKey, item.storageProvider, item.id) } });
  } catch (error) {
    if (stored) await removeStoredFile(stored.storageKey, stored.storageProvider).catch(() => undefined);
    else await unlink(file.path).catch(() => undefined);
    throw error;
  }
}));

router.post('/media/:id/replace', upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  const file = req.file;
  if (!file) throw new HttpError(400, 'Choose a replacement file');
  const existing = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!existing) { await unlink(file.path).catch(() => undefined); throw new HttpError(404, 'Media not found'); }
  const detected = await fileTypeFromFile(file.path);
  const incomingType = file.mimetype.startsWith('image/') ? 'IMAGE' : file.mimetype.startsWith('video/') ? 'VIDEO' : 'AUDIO';
  const allowedDetected = incomingType === 'IMAGE' ? ['image/jpeg', 'image/png', 'image/webp'] : incomingType === 'VIDEO' ? ['video/mp4', 'video/webm'] : ['audio/mpeg', 'audio/mp4', 'audio/ogg'];
  if (!detected || !allowedDetected.includes(detected.mime)) { await unlink(file.path).catch(() => undefined); throw new HttpError(415, 'The uploaded file content does not match an allowed media type'); }
  if (incomingType !== existing.type) {
    await unlink(file.path).catch(() => undefined);
    throw new HttpError(400, 'Replacement must use the same media type');
  }
  if (file.size > uploadLimitFor(incomingType)) {
    await unlink(file.path).catch(() => undefined);
    throw new HttpError(413, `File exceeds the ${incomingType.toLowerCase()} upload limit`);
  }
  const stored = await persistUploadedFile(file);
  try {
    const item = await prisma.media.update({ where: { id: existing.id }, data: { storageKey: stored.storageKey, storageProvider: stored.storageProvider, mimeType: file.mimetype, sizeBytes: file.size, originalName: file.originalname.slice(0, 255) } });
    await removeStoredFile(existing.storageKey, existing.storageProvider).catch(() => undefined);
    await logAction(req.adminId!, 'REPLACE', 'Media', item.id);
    res.json({ item: { ...item, url: await createMediaUrl(item.storageKey, item.storageProvider, item.id) } });
  } catch (error) {
    await removeStoredFile(stored.storageKey, stored.storageProvider).catch(() => undefined);
    throw error;
  }
}));

router.patch('/media/:id', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({
    title: z.string().max(191).optional(), caption: z.string().max(5000).optional(),
    description: z.string().max(10000).nullable().optional(), category: z.string().max(100).nullable().optional(),
    featured: z.boolean().optional(), published: z.boolean().optional(), sortOrder: z.number().int().optional(),
    dateTaken: z.string().nullable().optional(), timelineMilestoneId: z.string().nullable().optional(),
  }).parse(req.body);
  const item = await prisma.media.update({ where: { id: req.params.id }, data: {
    ...input,
    dateTaken: input.dateTaken === undefined ? undefined : input.dateTaken ? new Date(input.dateTaken) : null,
  } });
  await logAction(req.adminId!, 'UPDATE', 'Media', item.id);
  res.json({ item: { ...item, url: await createMediaUrl(item.storageKey, item.storageProvider, item.id) } });
}));

router.delete('/media/:id', asyncHandler(async (req: AuthRequest, res) => {
  const item = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!item) throw new HttpError(404, 'Media not found');
  await prisma.media.delete({ where: { id: item.id } });
  await removeStoredFile(item.storageKey, item.storageProvider);
  await logAction(req.adminId!, 'DELETE', 'Media', item.id);
  res.json({ success: true });
}));

router.get('/timeline', asyncHandler(async (_req, res) => {
  res.json({ items: await prisma.timelineMilestone.findMany({ include: { media: true }, orderBy: [{ sortOrder: 'asc' }, { month: 'asc' }] }) });
}));

router.post('/timeline', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({ month: z.number().int().min(1).max(12), title: z.string().min(1).max(191), description: z.string().max(10000).optional(), memoryDate: z.string().nullable().optional(), sortOrder: z.number().int().optional(), published: z.boolean().optional() }).parse(req.body);
  const item = await prisma.timelineMilestone.upsert({ where: { month: input.month }, create: { ...input, memoryDate: input.memoryDate ? new Date(input.memoryDate) : null }, update: { ...input, memoryDate: input.memoryDate ? new Date(input.memoryDate) : null } });
  await logAction(req.adminId!, 'UPSERT', 'TimelineMilestone', item.id);
  res.status(201).json({ item });
}));

router.patch('/timeline/:id', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({ month: z.number().int().min(1).max(12).optional(), title: z.string().min(1).max(191).optional(), description: z.string().max(10000).nullable().optional(), memoryDate: z.string().nullable().optional(), sortOrder: z.number().int().optional(), published: z.boolean().optional() }).parse(req.body);
  const item = await prisma.timelineMilestone.update({ where: { id: req.params.id }, data: { ...input, memoryDate: input.memoryDate === undefined ? undefined : input.memoryDate ? new Date(input.memoryDate) : null } });
  await logAction(req.adminId!, 'UPDATE', 'TimelineMilestone', item.id);
  res.json({ item });
}));

router.delete('/timeline/:id', asyncHandler(async (req: AuthRequest, res) => {
  await prisma.timelineMilestone.delete({ where: { id: req.params.id } });
  await logAction(req.adminId!, 'DELETE', 'TimelineMilestone', req.params.id);
  res.json({ success: true });
}));

router.get('/memories', asyncHandler(async (_req, res) => {
  res.json({ items: await prisma.memory.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }) });
}));

router.post('/memories', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({ title: z.string().min(1).max(191), description: z.string().max(10000).optional(), category: z.string().max(100).optional(), memoryDate: z.string().nullable().optional(), sortOrder: z.number().int().optional(), featured: z.boolean().optional(), published: z.boolean().optional() }).parse(req.body);
  const item = await prisma.memory.create({ data: { ...input, memoryDate: input.memoryDate ? new Date(input.memoryDate) : null } });
  await logAction(req.adminId!, 'CREATE', 'Memory', item.id);
  res.status(201).json({ item });
}));

router.patch('/memories/:id', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({ title: z.string().min(1).max(191).optional(), description: z.string().max(10000).nullable().optional(), category: z.string().max(100).nullable().optional(), memoryDate: z.string().nullable().optional(), sortOrder: z.number().int().optional(), featured: z.boolean().optional(), published: z.boolean().optional() }).parse(req.body);
  const item = await prisma.memory.update({ where: { id: req.params.id }, data: { ...input, memoryDate: input.memoryDate === undefined ? undefined : input.memoryDate ? new Date(input.memoryDate) : null } });
  await logAction(req.adminId!, 'UPDATE', 'Memory', item.id);
  res.json({ item });
}));

router.delete('/memories/:id', asyncHandler(async (req: AuthRequest, res) => {
  await prisma.memory.delete({ where: { id: req.params.id } });
  await logAction(req.adminId!, 'DELETE', 'Memory', req.params.id);
  res.json({ success: true });
}));

router.get('/content', asyncHandler(async (_req, res) => {
  res.json({ content: await prisma.birthdayContent.findUnique({ where: { id: 1 } }) });
}));

router.put('/content', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({
    heroTitle: z.string().max(191), babyName: z.string().max(191), heroSubtitle: z.string().max(255),
    heroDescription: z.string().max(3000), storyTitle: z.string().max(191), storyText: z.string().max(10000),
    birthdayLetter: z.string().max(12000), footerMessage: z.string().max(255),
  }).parse(req.body);
  const content = await prisma.birthdayContent.upsert({ where: { id: 1 }, create: { id: 1, ...input }, update: input });
  await logAction(req.adminId!, 'UPDATE', 'BirthdayContent', '1');
  res.json({ content });
}));

router.get('/settings', asyncHandler(async (_req, res) => {
  const settings = await prisma.websiteSetting.findUnique({ where: { id: 1 } });
  if (!settings) return res.json({ settings: null });
  const { sitePasswordHash: _hidden, ...safe } = settings;
  res.json({ settings: safe, hasSitePassword: Boolean(settings.sitePasswordHash) });
}));

router.put('/settings', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({
    visibility: z.enum(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED']).optional(),
    sitePassword: z.string().min(8).max(200).optional().or(z.literal('')),
    allowWishes: z.boolean().optional(), backgroundMusicEnabled: z.boolean().optional(),
    searchIndexingEnabled: z.boolean().optional(), siteTitle: z.string().max(191).optional(),
    metaDescription: z.string().max(1000).optional(),
  }).parse(req.body);
  const data = {
    visibility: input.visibility,
    allowWishes: input.allowWishes,
    backgroundMusicEnabled: input.backgroundMusicEnabled,
    searchIndexingEnabled: input.searchIndexingEnabled,
    siteTitle: input.siteTitle,
    metaDescription: input.metaDescription,
    ...(input.sitePassword ? { sitePasswordHash: await bcrypt.hash(input.sitePassword, 12) } : {}),
  };
  if (input.visibility === 'PASSWORD_PROTECTED' && !input.sitePassword) {
    const current = await prisma.websiteSetting.findUnique({ where: { id: 1 } });
    if (!current?.sitePasswordHash) throw new HttpError(400, 'Set a website password before enabling password-protected mode');
  }
  const settings = await prisma.websiteSetting.update({ where: { id: 1 }, data });
  await logAction(req.adminId!, 'UPDATE', 'WebsiteSetting', '1');
  const { sitePasswordHash: _hidden, ...safe } = settings;
  res.json({ settings: safe, hasSitePassword: Boolean(settings.sitePasswordHash) });
}));

router.get('/wishes', asyncHandler(async (_req, res) => {
  res.json({ items: await prisma.birthdayWish.findMany({ orderBy: { createdAt: 'desc' } }) });
}));

router.patch('/wishes/:id', asyncHandler(async (req: AuthRequest, res) => {
  const input = z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']) }).parse(req.body);
  const item = await prisma.birthdayWish.update({ where: { id: req.params.id }, data: { status: input.status } });
  await logAction(req.adminId!, 'MODERATE', 'BirthdayWish', item.id);
  res.json({ item });
}));

router.delete('/wishes/:id', asyncHandler(async (req: AuthRequest, res) => {
  await prisma.birthdayWish.delete({ where: { id: req.params.id } });
  await logAction(req.adminId!, 'DELETE', 'BirthdayWish', req.params.id);
  res.json({ success: true });
}));

router.get('/activity', asyncHandler(async (_req, res) => {
  res.json({ items: await prisma.adminActivityLog.findMany({ take: 30, orderBy: { createdAt: 'desc' }, include: { admin: { select: { email: true } } } }) });
}));

export default router;
