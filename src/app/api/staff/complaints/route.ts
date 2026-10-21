import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const staffRoles: UserRole[] = [UserRole.FIELD_WORKER, UserRole.SUPERVISOR, UserRole.ADMIN];

export async function GET() {
  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!staffRoles.includes(user.role)) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  try {
    const teamMemberships =
      user.role === UserRole.FIELD_WORKER
        ? await prisma.teamMember.findMany({
            where: { userId: user.id },
            select: { teamId: true },
          })
        : null;

    const complaints = await prisma.complaint.findMany({
      where:
        teamMemberships === null
          ? undefined
          : { assignedTeamId: { in: teamMemberships.map((membership) => membership.teamId) } },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        trackingCode: true,
        title: true,
        category: true,
        description: true,
        location: true,
        ward: true,
        latitude: true,
        longitude: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        slaDueAt: true,
        assignedTeam: { select: { id: true, name: true } },
        assignedDepartment: { select: { id: true, name: true } },
        events: {
          orderBy: { createdAt: "asc" },
          select: { status: true, note: true, createdAt: true },
        },
        evidence: {
          orderBy: { createdAt: "asc" },
          select: { id: true, type: true, mimeType: true, createdAt: true },
        },
        feedback: { select: { resolved: true, comment: true, createdAt: true } },
      },
    });
    const now = Date.now();

    return NextResponse.json({
      complaints: complaints.map((complaint) => ({
        ...complaint,
        slaOverdue:
          complaint.slaDueAt !== null &&
          complaint.slaDueAt.getTime() < now &&
          complaint.status !== "RESOLVED" &&
          complaint.status !== "REJECTED",
        evidence: complaint.evidence.map((item) => ({
          ...item,
          url: `/api/complaints/${encodeURIComponent(complaint.trackingCode)}/evidence/${item.id}`,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to load staff complaints:", error);
    return NextResponse.json({ error: "Unable to load staff complaints." }, { status: 500 });
  }
}
