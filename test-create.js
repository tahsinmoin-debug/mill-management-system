require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const worker = await prisma.worker.findFirst();
    const machine = await prisma.machine.findFirst();
    
    if (!worker || !machine) {
      console.log('No worker or machine found');
      return;
    }

    console.log('Attempting to create entry...');
    const entry = await prisma.productionEntry.create({
      data: {
        date: '2026-07-01',
        workerId: worker.id,
        machineId: machine.id,
        segments: [1000],
        totalYards: 1000
      }
    });
    console.log('Success:', entry);
  } catch (err) {
    console.error('Error creating entry:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
