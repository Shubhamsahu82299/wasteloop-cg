import "server-only";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentAppUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, clerkUserId: true, role: true },
  });
}
