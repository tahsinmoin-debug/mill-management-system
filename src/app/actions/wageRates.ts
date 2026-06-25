"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWageRates() {
  return prisma.wageRate.findMany({
    orderBy: { effectiveFrom: 'desc' }
  });
}

export async function createWageRate(data: { ratePerYard: number, effectiveFrom: string }) {
  await prisma.wageRate.create({ data });
  revalidatePath('/settings/wage-rate');
}
