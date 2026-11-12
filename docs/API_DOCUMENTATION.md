# API overview

Base URL in local development: `http://localhost:4000/api`.

## Health
- `GET /health`

## Authentication
- `POST /auth/login` — email/password; sets HttpOnly admin cookie.
- `POST /auth/logout` — clears admin cookie.
- `GET /auth/me` — current admin.
- `POST /auth/change-password` — change admin password.

## Public
- `POST /public/access` — exchange website password for an 8-hour site-access cookie.
- `GET /public/bootstrap` — content, settings, media, timeline, approved wishes.
- `POST /public/wishes` — submit a wish; stored pending moderation.
- `GET /public/media/:id` — guarded local media delivery (or redirect to a signed S3 URL).

## Admin (requires admin cookie)
- `GET /admin/overview`
- `GET /admin/media?type=IMAGE|VIDEO|AUDIO`
- `POST /admin/media` — multipart form with `file`, `title`, `caption`, `category`, `dateTaken`, `featured`, optional `timelineMilestoneId`; supports sequential multi-file uploads from the dashboard.
- `POST /admin/media/:id/replace` — replace an existing file with the same media type.
- `PATCH /admin/media/:id`
- `DELETE /admin/media/:id`
- `GET /admin/timeline`
- `POST /admin/timeline`
- `PATCH /admin/timeline/:id`
- `DELETE /admin/timeline/:id`
- `GET /admin/memories`
- `POST /admin/memories`
- `PATCH /admin/memories/:id`
- `DELETE /admin/memories/:id`
- `GET /admin/content`
- `PUT /admin/content`
- `GET /admin/settings`
- `PUT /admin/settings`
- `GET /admin/wishes`
- `PATCH /admin/wishes/:id` — status: PENDING, APPROVED, REJECTED.
- `DELETE /admin/wishes/:id`
- `GET /admin/activity`

All admin routes require authentication. Cookie-authenticated unsafe requests must also match the configured frontend Origin. Inputs are validated server-side. API errors use JSON `{ "error": "..." }` responses.
