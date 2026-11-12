# Maher Ayan Birthday Website — শুরু করার নির্দেশনা

তোমার কম্পিউটারে project চালাতে নিচের ধাপগুলো অনুসরণ করো। এই project এখনো Live/Deploy করা হয়নি।

## ১. যা লাগবে

- Node.js 20 বা তার পরের সংস্করণ
- npm 10 বা তার পরের সংস্করণ
- MySQL 8
- Cursor / VS Code (ঐচ্ছিক, code edit করার জন্য)

## ২. Project ওপেন করো

ZIP extract করে `maher-ayan-birthday` folder Cursor বা VS Code-এ Open করো।

## ৩. MySQL Database তৈরি করো

MySQL Workbench বা phpMyAdmin-এ নিচের database তৈরি করো:

```sql
CREATE DATABASE maher_ayan_birthday CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## ৪. Environment file তৈরি করো

Project root-এর `.env.example` ফাইলটি copy করে `backend/.env` নামে রাখো। এরপর নিজের MySQL username/password বসাও।

বিশেষভাবে এগুলো পরিবর্তন করবে:

- `DATABASE_URL`
- `JWT_SECRET` — দীর্ঘ random secret দেবে
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` — শক্তিশালী password দেবে

উদাহরণ:

```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/maher_ayan_birthday"
JWT_SECRET=replace-this-with-a-long-random-secret-value
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=use-a-strong-password-here
```

কোনো real password বা secret GitHub-এ upload করবে না।

## ৫. Dependency install এবং database setup

Terminal-এ project root থেকে চালাবে:

```bash
npm install
npm run db:generate
npm run db:migrate -w backend
npm run db:seed
```

Prisma migration-এর নাম চাইলে `init` দিতে পারো। Project-এর initial migration ইতোমধ্যে `backend/prisma/migrations` folder-এ রাখা হয়েছে।

## ৬. Website চালু করো

```bash
npm run dev
```

তারপর browser-এ:

- Public Birthday Website: `http://localhost:5173`
- Admin Dashboard: `http://localhost:5173/admin`
- API Health Check: `http://localhost:4000/api/health`

Admin login-এর জন্য `backend/.env`-এ দেওয়া `ADMIN_EMAIL` ও `ADMIN_PASSWORD` ব্যবহার করবে।

## ৭. ছবি ও ভিডিও যোগ করা

Admin Dashboard-এ login করে:

- Photos → ছবি upload, caption, category, date, timeline month, featured photo নির্ধারণ
- Videos → MP4/WebM upload
- Music → audio upload; category `background-music` রাখবে
- Timeline → ১২ মাসের title ও description edit
- Special moments → ব্যক্তিগত milestone যোগ
- Birthday content → hero text, story ও birthday letter edit
- Wishes → visitor-এর শুভেচ্ছা approve/reject
- Settings → website public/private/password-protected করা

শুরুতে আসল ছবি না থাকায় website-এ placeholder দেখা যাবে। Photos থেকে একটি ছবিকে Featured করলে সেটি hero section-এ দেখা যাবে।

## ৮. গুরুত্বপূর্ণ Privacy নির্দেশনা

এটি একটি শিশুর ছবি ও পারিবারিক ভিডিও রাখার website। Public করার আগে পরিবারের অনুমতি নেবে। Personal family archive হলে Settings থেকে `Password protected` অথবা `Private` বেছে নেবে। Production-এ private S3-compatible bucket এবং HTTPS ব্যবহার করবে।

## ৯. এখনো যা configure করতে হবে

- নিজের MySQL connection
- Admin email/password
- Production hosting
- Production-এর private S3-compatible storage credentials
- পরিবারের আসল ছবি, ভিডিও ও birthday content

কোনো Live Deployment স্বয়ংক্রিয়ভাবে করা হয়নি।
