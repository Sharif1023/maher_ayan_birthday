# Maher Ayan — One Whole Year of Love

A full-stack first-birthday memory website with a cinematic Baby Blue + Cream public experience, a private family admin dashboard, photo/video management, a 12-month timeline, birthday content editing, and moderated guest wishes.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, TypeScript
- Database: MySQL + Prisma ORM
- Admin authentication: bcrypt password hashing + HttpOnly JWT cookie
- Media: local development storage, optional S3-compatible object storage with short-lived signed URLs

## Project layout

```text
frontend/       Public website and admin dashboard
backend/        REST API, authentication, upload handling
backend/prisma/ MySQL Prisma schema
backend/uploads/ Local development media (ignored by Git)
docs/           Setup, admin, API, and deployment guides
```

বাংলা সেটআপ নির্দেশনার জন্য `START_HERE_BN.md` দেখুন।

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MySQL 8 or compatible MySQL service

## Local setup

1. Create a MySQL database named `maher_ayan_birthday`.
2. Copy `.env.example` to `backend/.env`.
3. Set `DATABASE_URL`, a long random `JWT_SECRET`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` in `backend/.env`.
4. From the project root, run:

```bash
npm install
npm run db:generate
npm run db:migrate -w backend -- --name init
npm run db:seed
npm run dev
```

5. Open the public website at `http://localhost:5173`.
6. Open the admin dashboard at `http://localhost:5173/admin` and sign in with the configured admin email/password.

The first database migration command may ask Prisma to create the initial migration. Keep the generated migration files in source control.

## Media uploads

In local development, uploaded files are stored under `backend/uploads/` and served through an API route. Supported images: JPG, PNG, WebP. Supported videos: MP4, WebM. Audio: MP3, MP4 audio, OGG. The backend checks the detected file signature in addition to the browser-provided MIME type. Upload limits are configurable in `backend/.env`.

For production, configure a private S3-compatible bucket using the `S3_*` variables in `.env.example`. The API generates short-lived signed media URLs. Keep the bucket private and never expose storage credentials in frontend variables.

## Privacy

The site can be configured as:

- `PUBLIC`: visitors with the link can view it.
- `PASSWORD_PROTECTED`: visitors must enter the website password.
- `PRIVATE`: only an authenticated administrator can view the site through the API.

For a family archive containing a child's photographs, prefer `PASSWORD_PROTECTED` or `PRIVATE`, use HTTPS, configure private object storage, and keep administrator credentials secure. A public website should only contain media the family is comfortable sharing.

## Important notes

- No actual baby photographs or family videos are bundled. The public site uses tasteful placeholders until the family uploads real media.
- The 12 timeline titles are editable starter copy, not verified personal milestones.
- Background music requires an audio upload with category `background-music`, and the music setting must be enabled. Playback starts only after a visitor clicks the player.
- Public birthday wishes are stored as pending and only appear after admin approval.
- This project is not deployed. Review security settings and test the production environment before publishing.

## Commands

```bash
npm run dev                 # Run frontend and backend
npm run build               # Build backend and frontend
npm run typecheck           # Type-check both workspaces
npm run db:generate         # Generate Prisma client
npm run db:migrate -w backend -- --name <migration-name>
npm run db:seed             # Seed starter content and configured admin
```
