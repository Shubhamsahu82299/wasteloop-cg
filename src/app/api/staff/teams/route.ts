import { randomUUID } from "node:crypto";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

export async function GET() {
  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (user.role !== UserRole.SUPERVISOR && user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Supervisor access required." }, { status: 403 });
  }

  try {
    const teams = await prisma.team.findMany({
      orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        department: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Failed to load teams:", error);
    return NextResponse.json({ error: "Unable to load teams." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 8 * 1024) {
    return NextResponse.json({ error: "Team details are too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Team details are invalid." }, { status: 400 });
  }

  const departmentName = typeof body.departmentName === "string" ? body.departmentName.trim() : "";
  const teamName = typeof body.teamName === "string" ? body.teamName.trim() : "";
  if (!departmentName || departmentName.length > 120 || !teamName || teamName.length > 120) {
    return NextResponse.json({ error: "Department and team names are required." }, { status: 400 });
  }

  let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>>;
  try {
    rateLimit = await consumeRateLimit(`admin-team:${actor.id}`, 20, 10 * 60_000);
  } catch (error) {
    console.error("Team administration rate limit check failed:", error);
    return NextResponse.json({ error: "Team administration is temporarily unavailable." }, { status: 503 });
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Team administration request limit reached. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const team = await prisma.$transaction(async (transaction) => {
      const department = await transaction.department.upsert({
        where: { name: departmentName },
        create: { name: departmentName },
        update: {},
        select: { id: true, name: true },
      });
      const createdTeam = await transaction.team.create({
        data: { name: teamName, departmentId: department.id },
        select: {
          id: true,
          name: true,
          department: { select: { id: true, name: true } },
        },
      });
      await transaction.$executeRaw`
        INSERT INTO "StaffAdminEvent" ("id", "actorId", "action", "details", "createdAt")
        VALUES (
          ${randomUUID()},
          ${actor.id},
          'TEAM_CREATED',
          ${JSON.stringify({
            teamId: createdTeam.id,
            teamName: createdTeam.name,
            departmentId: department.id,
            departmentName: department.name,
          })}::jsonb,
          ${new Date()}
        )
      `;
      return createdTeam;
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    if (hasPrismaCode(error, "P2002")) {
      return NextResponse.json({ error: "That team already exists in this department." }, { status: 409 });
    }
    console.error("Failed to create team:", error);
    return NextResponse.json({ error: "Unable to create team." }, { status: 500 });
  }
}
