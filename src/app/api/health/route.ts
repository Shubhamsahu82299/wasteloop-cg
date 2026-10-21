import { NextResponse } from "next/server";
import { isObjectStorageConfigured } from "@/lib/object-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch (error) {
    console.error("Health check database query failed:", error);
  }

  const checks = {
    authentication: Boolean(
      process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ),
    database,
    evidenceStorage: isObjectStorageConfigured(),
    aiTriage: Boolean(process.env.GEMINI_API_KEY),
  };
  const ready = checks.authentication && checks.database && checks.evidenceStorage;

  return NextResponse.json(
    { status: ready ? "ready" : "degraded", checks },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
