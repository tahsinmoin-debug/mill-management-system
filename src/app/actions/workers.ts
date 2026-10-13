"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { revalidatePath } from "next/cache";

export async function getWorkers() {
  await requireUser();
  return prisma.worker.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getActiveWorkers() {
  await requireUser();
  return prisma.worker.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' }
  });
}

export async function createWorker(data: { workerId: string, name: string, joiningDate: string }) {
  await requireUser();
  await prisma.worker.create({ data });
  revalidatePath('/workers');
}

export async function updateWorkerStatus(id: string, status: string) {
  await requireUser();
  await prisma.worker.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/workers');
}
