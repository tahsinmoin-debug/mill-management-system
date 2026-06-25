import bcrypt from 'bcryptjs';
import prisma from './src/lib/prisma';

async function main() {
  const hash = await bcrypt.hash("Tomatoma1234", 10);
  const user = await prisma.user.upsert({
    where: { username: "Toma" },
    update: {},
    create: {
      name: "Toma (Admin)",
      username: "Toma",
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  console.log("Admin user created/verified:", user.username);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
