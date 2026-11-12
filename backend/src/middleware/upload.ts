import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

const allowed = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/ogg',
]);

export const upload = multer({
  storage,
  limits: { fileSize: Math.max(env.maxVideoMb, env.maxImageMb) * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new HttpError(415, 'Unsupported file type'));
    cb(null, true);
  },
});
