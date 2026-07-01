const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('WageRates:', await prisma.wageRate.findMany());
  console.log('Entries:', await prisma.productionEntry.findMany());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
