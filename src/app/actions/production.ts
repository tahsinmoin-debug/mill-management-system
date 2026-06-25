"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEntriesForDate(date: string) {
  return prisma.productionEntry.findMany({
    where: { date },
    include: { machine: true, worker: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createProductionEntry(data: {
  date: string;
  workerId: string;
  machineId: string;
  segments: number[];
  totalYards: number;
}) {
  await prisma.productionEntry.create({ data });
  revalidatePath('/entry');
  revalidatePath('/dashboard');
  revalidatePath('/reports/daily');
  revalidatePath('/reports/monthly');
}

export async function getEntriesForMonth(monthStr: string) {
  return prisma.productionEntry.findMany({
    where: {
      date: {
        startsWith: monthStr
      }
    },
    include: { machine: true, worker: true }
  });
}
