"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { revalidatePath } from "next/cache";

export async function getMachines() {
  await requireUser();
  return prisma.machine.findMany({
    orderBy: { machineNumber: 'asc' }
  });
}

export async function getActiveMachines() {
  await requireUser();
  return prisma.machine.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { machineNumber: 'asc' }
  });
}

export async function createMachine(data: { machineNumber: number, typeModel: string }) {
  await requireUser();
  await prisma.machine.create({ data });
  revalidatePath('/machines');
  revalidatePath('/dashboard');
}

export async function updateMachineStatus(id: string, status: string) {
  await requireUser();
  await prisma.machine.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/machines');
  revalidatePath('/dashboard');
}
