import bcrypt from 'bcryptjs';
import prisma from './src/lib/prisma';

// Creates the admin account, or resets its password if it already exists.
// Credentials come from environment variables so they never live in git.
//
// Usage (put these in .env.local, which is git-ignored):
//   ADMIN_USERNAME=...
//   ADMIN_NAME=...
//   ADMIN_PASSWORD=...
// then run:
//   npx tsx --env-file=.env.local seed.ts

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const name = process.env.ADMIN_NAME ?? username;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD before running the seed.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash: hash, role: 'ADMIN' },
    create: {
      name: name!,
      username,
      passwordHash: hash,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created or password reset:', user.username);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
