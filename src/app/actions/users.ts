"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });
}

export async function createUser(data: { name: string, username: string, passwordHash: string, role: string }) {
  const hash = await bcrypt.hash(data.passwordHash, 10);
  await prisma.user.create({
    data: { ...data, passwordHash: hash }
  });
  revalidatePath('/settings/users');
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath('/settings/users');
}
