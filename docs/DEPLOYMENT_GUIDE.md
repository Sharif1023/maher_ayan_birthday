# Deployment preparation

This repository is a local development deliverable and has not been deployed.

## Before production

1. Use a managed MySQL database with automated backups.
2. Set `NODE_ENV=production` and a random `JWT_SECRET` of at least 32 characters.
3. Set `COOKIE_SECURE=true`, serve over HTTPS, and configure the correct `COOKIE_SAME_SITE` value for the frontend/backend domain arrangement.
4. Configure `FRONTEND_ORIGIN` to the exact public frontend origin.
5. Configure a private S3-compatible bucket and IAM credentials with least-privilege access. Keep the bucket private.
6. Set appropriate `MAX_IMAGE_MB` and `MAX_VIDEO_MB` limits for the hosting environment.
7. Run Prisma migrations as a controlled deployment step.
8. Seed the administrator once with a strong unique password, then change it after first login.
9. Set website visibility to Password Protected or Private until the family approves public sharing.
10. Keep `searchIndexingEnabled` false until public indexing is explicitly approved.
11. Configure database and object-storage backups and test restoration.
12. Run functional, security, and responsive tests against the production-like environment.

## Hosting topology

- Frontend: static hosting or a Node-compatible web host.
- Backend: Node.js service with persistent environment variables.
- Database: managed MySQL.
- Media: private S3-compatible object storage.

The frontend should call the backend over HTTPS. Configure CORS and cookie domain settings to match the chosen hosting topology. Do not put server secrets in `VITE_*` variables.

## Go-live gate

Do not publish until the family has reviewed all uploaded photos/videos, tested password-protected access, verified admin recovery, and explicitly approved deployment.
