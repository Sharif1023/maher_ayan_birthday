import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';

const letter = `Dear Maher Ayan,\n\nOne year ago, you came into our lives and made everything more beautiful.\n\nYour little smile brings happiness, your laughter fills our hearts, and every moment with you becomes a precious memory.\n\nWatching you grow has been the most beautiful journey.\n\nMay your life always be filled with happiness, love, laughter, good health, and endless adventures.\n\nNo matter how big you grow, you will always be our little sunshine.\n\nHappy 1st Birthday, Maher Ayan!\n\nWith endless love.`;

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && password !== 'change-this-before-first-run') {
    await prisma.adminUser.upsert({
      where: { email },
      create: { email, passwordHash: await bcrypt.hash(password, 12) },
      update: {},
    });
  } else {
    console.warn('Admin was not seeded. Set ADMIN_EMAIL and a strong ADMIN_PASSWORD in backend/.env, then rerun db:seed.');
  }

  await prisma.birthdayContent.upsert({ where: { id: 1 }, create: { id: 1, birthdayLetter: letter, heroDescription: '365 days of smiles, cuddles, laughter, and countless beautiful memories.', storyText: 'A year of little discoveries, gentle cuddles, bright smiles, and moments we will treasure forever.' }, update: {} });
  await prisma.websiteSetting.upsert({ where: { id: 1 }, create: { id: 1, metaDescription: 'Celebrating the first beautiful year of Maher Ayan.' }, update: {} });

  const titles = [
    'A Beautiful Beginning', 'Little Smiles', 'Growing Curiosity', 'More Little Adventures',
    'Endless Cuddles', 'Halfway to ONE', 'Little Discoveries', 'More Reasons to Smile',
    'Growing Every Day', 'Precious Moments', 'Almost ONE', 'Our Little Birthday Star',
  ];
  for (let month = 1; month <= 12; month += 1) {
    await prisma.timelineMilestone.upsert({
      where: { month },
      create: { month, title: titles[month - 1], description: 'Add a real memory, date, and photographs for this month from the admin dashboard.', sortOrder: month },
      update: {},
    });
  }
  console.log('Seed complete. Default content and timeline are ready.');
}

main().finally(async () => prisma.$disconnect());
