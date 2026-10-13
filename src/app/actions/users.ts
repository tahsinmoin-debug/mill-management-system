"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });
}

export async function createUser(data: { name: string, username: string, passwordHash: string, role: string }) {
  await requireAdmin();
  if (data.role !== "ADMIN" && data.role !== "MANAGER") {
    throw new Error("Invalid role");
  }
  const hash = await bcrypt.hash(data.passwordHash, 10);
  await prisma.user.create({
    data: { ...data, passwordHash: hash }
  });
  revalidatePath('/settings/users');
}

export async function deleteUser(id: string) {
  const currentUser = await requireAdmin();
  if (currentUser.id === id) {
    throw new Error("You cannot delete your own account");
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath('/settings/users');
}
