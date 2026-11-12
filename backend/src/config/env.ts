import 'dotenv/config';

const requiredInProduction = ['JWT_SECRET', 'DATABASE_URL'];
if (process.env.NODE_ENV === 'production') {
  for (const key of requiredInProduction) {
    if (!process.env[key]) throw new Error(`${key} is required in production`);
  }
  if ((process.env.JWT_SECRET ?? '').length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret-change-this-before-production',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
  maxImageMb: Number(process.env.MAX_IMAGE_MB ?? 15),
  maxVideoMb: Number(process.env.MAX_VIDEO_MB ?? 250),
};
