"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWorkers() {
  return prisma.worker.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getActiveWorkers() {
  return prisma.worker.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' }
  });
}

export async function createWorker(data: { workerId: string, name: string, joiningDate: string }) {
  await prisma.worker.create({ data });
  revalidatePath('/workers');
}

export async function updateWorkerStatus(id: string, status: string) {
  await prisma.worker.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/workers');
}
