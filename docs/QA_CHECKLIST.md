# QA checklist

## Public experience
- [ ] Hero, navigation, and section anchors work.
- [ ] Featured photo renders without distortion.
- [ ] Timeline renders all published months.
- [ ] Gallery filtering and lightbox work.
- [ ] Video modal playback works on mobile and desktop.
- [ ] Birthday wish interaction triggers confetti.
- [ ] Background music starts only after user interaction.
- [ ] Guest wish form validates and reports pending moderation.
- [ ] Reduced-motion preference is respected.

## Admin
- [ ] Login/logout and session expiry work.
- [ ] Unauthorized requests are rejected.
- [ ] Photo/video/audio upload validates MIME type and size.
- [ ] Media metadata can be edited and saved.
- [ ] Media deletion removes the DB record and stored object.
- [ ] Timeline entries can be edited.
- [ ] Birthday content can be updated.
- [ ] Wishes can be approved/rejected/deleted.
- [ ] Visibility and password settings work.

## Security and operations
- [ ] HTTPS and secure cookies enabled in production.
- [ ] JWT secret is unique and sufficiently long.
- [ ] S3 bucket is private and credentials are server-side only.
- [ ] Database backups and restore tested.
- [ ] No real child media is exposed before family approval.
- [ ] No secrets are committed to source control.
