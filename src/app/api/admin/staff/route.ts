import { randomUUID } from "node:crypto";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const staffRoles = [UserRole.FIELD_WORKER, UserRole.SUPERVISOR, UserRole.ADMIN];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStaffRole(role: unknown): role is (typeof staffRoles)[number] {
  return staffRoles.some((staffRole) => staffRole === role);
}

function isTeamIdList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= 50 &&
    value.every((teamId) => typeof teamId === "string" && teamId.length > 0 && teamId.length <= 100) &&
    new Set(value).size === value.length
  );
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

export async function GET() {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  try {
    const [staff, audit] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: staffRoles } },
        orderBy: [{ role: "asc" }, { name: "asc" }],
        select: {
          id: true,
          clerkUserId: true,
          name: true,
          email: true,
          role: true,
          teamMemberships: {
            orderBy: { team: { name: "asc" } },
            select: {
              team: {
                select: {
                  id: true,
                  name: true,
                  department: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
      prisma.$queryRaw<
        {
          id: string;
          action: string;
          actorName: string | null;
          targetName: string | null;
          details: unknown;
          createdAt: Date;
        }[]
      >`
        SELECT event."id", event."action", actor."name" AS "actorName",
          target."name" AS "targetName", event."details", event."createdAt"
        FROM "StaffAdminEvent" event
        JOIN "User" actor ON actor."id" = event."actorId"
        LEFT JOIN "User" target ON target."id" = event."targetId"
        ORDER BY event."createdAt" DESC
        LIMIT 100
      `,
    ]);

    return NextResponse.json({
      staff,
      audit: audit.map((event) => ({
        id: event.id,
        action: event.action,
        actorName: event.actorName ?? "Unknown administrator",
        targetName: event.targetName,
        summary: summarizeAuditDetails(event.details),
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to load staff administration data:", error);
    return NextResponse.json({ error: "Unable to load staff administration data." }, { status: 500 });
  }
}

function summarizeAuditDetails(details: unknown): string | null {
  if (!isRecord(details)) return null;
  if (typeof details.role === "string") {
    const teams = Array.isArray(details.teamNames) &&
      details.teamNames.every((teamName) => typeof teamName === "string")
      ? details.teamNames.join(", ")
      : "";
    return teams ? `role: ${details.role}; teams: ${teams}` : `role: ${details.role}`;
  }
  if (typeof details.teamName === "string" && typeof details.departmentName === "string") {
    return `${details.departmentName} / ${details.teamName}`;
  }
  return null;
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
  if (Number.isFinite(contentLength) && contentLength > 16 * 1024) {
    return NextResponse.json({ error: "Staff details are too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Staff details are invalid." }, { status: 400 });
  }

  const clerkUserId = typeof body.clerkUserId === "string" ? body.clerkUserId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const role = body.role;
  const teamIds = body.teamIds;

  if (
    !/^user_[A-Za-z0-9_-]{1,250}$/.test(clerkUserId) ||
    !name ||
    name.length > 120 ||
    email.length > 254 ||
    (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
    !isStaffRole(role) ||
    !isTeamIdList(teamIds) ||
    (role !== UserRole.FIELD_WORKER && teamIds.length > 0)
  ) {
    return NextResponse.json({ error: "Staff details are invalid." }, { status: 400 });
  }

  let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>>;
  try {
    rateLimit = await consumeRateLimit(`admin-staff:${actor.id}`, 20, 10 * 60_000);
  } catch (error) {
    console.error("Staff administration rate limit check failed:", error);
    return NextResponse.json({ error: "Staff administration is temporarily unavailable." }, { status: 503 });
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Staff administration request limit reached. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const teams = teamIds.length
          ? await transaction.team.findMany({
              where: { id: { in: teamIds } },
              select: { id: true, name: true, department: { select: { name: true } } },
            })
          : [];
        if (teams.length !== teamIds.length) {
          throw new Error("One or more selected teams do not exist.");
        }

        const existing = await transaction.user.findUnique({
          where: { clerkUserId },
          select: { id: true, role: true, email: true },
        });
        if (existing?.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
          const administratorCount = await transaction.user.count({ where: { role: UserRole.ADMIN } });
          if (administratorCount <= 1) {
            throw new Error("The last administrator cannot be demoted.");
          }
        }

        const user = await transaction.user.upsert({
          where: { clerkUserId },
          create: {
            clerkUserId,
            name,
            email: email || null,
            role,
          },
          update: {
            name,
            email: email || existing?.email || null,
            role,
          },
          select: { id: true, clerkUserId: true, name: true, email: true, role: true },
        });

        await transaction.teamMember.deleteMany({ where: { userId: user.id } });
        if (teamIds.length > 0) {
          await transaction.teamMember.createMany({
            data: teamIds.map((teamId) => ({ userId: user.id, teamId })),
          });
        }

        await transaction.$executeRaw`
          INSERT INTO "StaffAdminEvent" ("id", "actorId", "targetId", "action", "details", "createdAt")
          VALUES (
            ${randomUUID()},
            ${actor.id},
            ${user.id},
            ${existing ? "STAFF_ACCOUNT_UPDATED" : "STAFF_ACCOUNT_CREATED"},
            ${JSON.stringify({
              role,
              teamNames: teams.map((team) => `${team.department.name} / ${team.name}`),
            })}::jsonb,
            ${new Date()}
          )
        `;

        return user;
      },
      { isolationLevel: "Serializable" },
    );

    return NextResponse.json({ staff: result }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "One or more selected teams do not exist.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "The last administrator cannot be demoted.") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (hasPrismaCode(error, "P2034")) {
      return NextResponse.json({ error: "Staff details changed concurrently. Please retry." }, { status: 409 });
    }
    console.error("Failed to save staff account:", error);
    return NextResponse.json({ error: "Unable to save staff account." }, { status: 500 });
  }
}
