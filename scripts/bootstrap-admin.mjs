import { UserRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const clerkUserId = process.env.BOOTSTRAP_ADMIN_CLERK_USER_ID?.trim();
if (!clerkUserId || !/^user_[A-Za-z0-9_-]{1,250}$/.test(clerkUserId)) {
  console.error("Set BOOTSTRAP_ADMIN_CLERK_USER_ID to an existing Clerk user ID.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  await prisma.$transaction(
    async (transaction) => {
      const administratorCount = await transaction.user.count({
        where: { role: UserRole.ADMIN },
      });
      if (administratorCount > 0) {
        throw new Error("An administrator is already configured.");
      }

      await transaction.user.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          name: "Administrator",
          role: UserRole.ADMIN,
        },
        update: { role: UserRole.ADMIN },
      });
    },
    { isolationLevel: "Serializable" },
  );
  console.log("Initial administrator account created.");
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Failed to bootstrap the initial administrator.",
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
