"use server";

import prisma from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/guards";
import { revalidatePath } from "next/cache";

export async function getWageRates() {
  await requireUser();
  return prisma.wageRate.findMany({
    orderBy: { effectiveFrom: 'desc' }
  });
}

export async function createWageRate(data: { ratePerYard: number, effectiveFrom: string }) {
  await requireAdmin();
  await prisma.wageRate.create({ data });
  revalidatePath('/settings/wage-rate');
}
