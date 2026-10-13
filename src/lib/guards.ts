import { auth } from "@/auth";

// Server actions are public HTTP endpoints in Next.js: anyone who knows an
// action's ID can call it directly, without going through the UI or the
// route protection in proxy.ts. Every action must check the session itself.

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user as typeof session.user & {
    id: string;
    username: string;
    role: string;
  };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
