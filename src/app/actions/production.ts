"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { revalidatePath } from "next/cache";

export async function getEntriesForDate(date: string) {
  await requireUser();
  return prisma.productionEntry.findMany({
    where: { date },
    include: { machine: true, worker: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createProductionEntries(entries: {
  date: string;
  workerId: string;
  machineId: string;
  segments: number[];
  totalYards: number;
}[]) {
  await requireUser();
  await prisma.productionEntry.createMany({
    data: entries.map(e => ({
      ...e,
      tanaCount: 0,
    }))
  });
  revalidatePath('/entry');
  revalidatePath('/dashboard');
  revalidatePath('/reports/weekly');
  revalidatePath('/reports/monthly');
}

export async function getMachineLifetimeYards(machineId: string, upToDate?: string) {
  await requireUser();
  const whereClause: any = { machineId };
  if (upToDate) {
    whereClause.date = { lt: upToDate };
  }
  const result = await prisma.productionEntry.aggregate({
    where: whereClause,
    _sum: { totalYards: true }
  });
  return result._sum.totalYards || 0;
}

export async function getMonthlyMachineTana(machineId: string, month: number, year: number) {
  await requireUser();
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? year + 1 : year;
  const startOfNextMonth = `${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const yardsBeforeMonth = await getMachineLifetimeYards(machineId, startOfMonth);
  const yardsBeforeNextMonth = await getMachineLifetimeYards(machineId, startOfNextMonth);

  return Math.floor(yardsBeforeNextMonth / 1700) - Math.floor(yardsBeforeMonth / 1700);
}

export async function getYearlyMachineTana(machineId: string, year: number) {
  await requireUser();
  const startOfYear = `${year}-01-01`;
  const startOfNextYear = `${year + 1}-01-01`;

  const yardsBeforeYear = await getMachineLifetimeYards(machineId, startOfYear);
  const yardsBeforeNextYear = await getMachineLifetimeYards(machineId, startOfNextYear);

  return Math.floor(yardsBeforeNextYear / 1700) - Math.floor(yardsBeforeYear / 1700);
}

export async function getYearlyTanaBreakdown(year: number) {
  await requireUser();
  const machines = await prisma.machine.findMany({ select: { id: true } });
  const monthlyTana = Array(12).fill(0);
  let yearlyTotal = 0;

  for (const m of machines) {
    let currentLifetimeYards = await getMachineLifetimeYards(m.id, `${year}-01-01`);
    let currentTana = Math.floor(currentLifetimeYards / 1700);

    for (let month = 1; month <= 12; month++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextMonthYear = month === 12 ? year + 1 : year;
      const startOfNextMonth = `${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-01`;
      
      const yardsBeforeNextMonth = await getMachineLifetimeYards(m.id, startOfNextMonth);
      const newTana = Math.floor(yardsBeforeNextMonth / 1700);
      
      const tanaProducedInMonth = newTana - currentTana;
      monthlyTana[month - 1] += tanaProducedInMonth;
      yearlyTotal += tanaProducedInMonth;
      
      currentTana = newTana;
    }
  }
  return { monthlyTana, yearlyTotal };
}

export async function getEntriesForMonth(monthStr: string) {
  await requireUser();
  return prisma.productionEntry.findMany({
    where: {
      date: {
        startsWith: monthStr
      }
    },
    include: { machine: true, worker: true }
  });
}

export async function getEntriesForYear(year: string) {
  await requireUser();
  return prisma.productionEntry.findMany({
    where: {
      date: {
        startsWith: year
      }
    },
    include: { machine: true, worker: true }
  });
}
