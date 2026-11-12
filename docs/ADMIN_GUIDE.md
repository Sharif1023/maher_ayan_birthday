# Admin guide

Open `/admin` and sign in with the administrator account configured in `backend/.env` before running the seed command.

## Photos

Use **Photos** to upload one or multiple image files. You can replace an existing file using the upload icon beside its record. Add a title, caption, category, optional date, and optionally mark one image as featured. The featured photograph is used in the hero/story areas. Edit titles and captions inline, then save. Delete removes the media record and stored file.

## Videos

Use **Videos** to upload one or multiple MP4 or WebM files. You can replace an existing video using the upload icon beside its record. Add a title, caption, and category. Visitors can play videos in an in-page modal. Videos do not autoplay with sound. Use **Music** to upload an audio file and keep its category as `background-music`; enable playback in Settings.

## Timeline

The initial seed creates twelve editable month chapters. Edit the titles and descriptions and save each row. The add-chapter form creates a missing month or updates the selected month. Upload a photo and assign it to a month to show it inside that timeline chapter.

## Birthday content

Edit the hero title, baby's name, birthday subtitle, story, letter, and footer message. Save to update the public website.

## Wishes

Guest wishes start as `PENDING`. Approve a wish to display it publicly, reject it to hide it, or delete it permanently.

## Settings

Choose Public, Password Protected, or Private visibility. Set a website password before enabling password-protected mode. You can also enable/disable guest wishes, background music, and search indexing.

## Background music

Use the **Music** area to upload an audio file with category `background-music`. Enable background music in Settings. Playback always requires visitor interaction.
