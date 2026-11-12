import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';

const bucket = process.env.S3_BUCKET;
const s3 = bucket ? new S3Client({
  region: process.env.S3_REGION ?? 'auto',
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
    : undefined,
}) : null;

export async function persistUploadedFile(file: Express.Multer.File) {
  if (s3 && bucket) {
    const key = `maher-ayan/${file.filename}`;
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(file.path),
      ContentType: file.mimetype,
      ContentLength: file.size,
    }));
    await unlink(file.path).catch(() => undefined);
    return { storageKey: key, storageProvider: 's3' };
  }
  return { storageKey: file.filename, storageProvider: 'local' };
}

export async function createMediaUrl(storageKey: string, storageProvider: string, mediaId: string) {
  if (storageProvider === 's3' && s3 && bucket) {
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: storageKey }), { expiresIn: 3600 });
  }
  return `/api/media/${encodeURIComponent(mediaId)}`;
}

export async function removeStoredFile(storageKey: string, storageProvider: string) {
  if (storageProvider === 's3' && s3 && bucket) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
    return;
  }
  const localPath = path.resolve(process.cwd(), 'uploads', path.basename(storageKey));
  await unlink(localPath).catch(() => undefined);
}

export function localMediaPath(storageKey: string) {
  return path.resolve(process.cwd(), 'uploads', path.basename(storageKey));
}

export const uploadLimitFor = (type: string) => {
  if (type === 'VIDEO') return env.maxVideoMb * 1024 * 1024;
  if (type === 'AUDIO') return 30 * 1024 * 1024;
  return env.maxImageMb * 1024 * 1024;
};
