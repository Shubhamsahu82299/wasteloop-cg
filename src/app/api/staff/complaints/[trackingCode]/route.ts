import { CaseStatus, EvidenceType, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  canTransitionCaseStatus,
  parseCasePriority,
  parseCaseStatus,
} from "@/lib/complaint-workflow";
import { validateCivicCompletionWeight } from "@/lib/civic-issues";
import { getSlaDueAt } from "@/lib/sla";

export const runtime = "nodejs";

const staffRoles: UserRole[] = [UserRole.FIELD_WORKER, UserRole.SUPERVISOR, UserRole.ADMIN];
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trackingCode: string }> },
) {
  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!staffRoles.includes(user.role)) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 8 * 1024) {
    return NextResponse.json({ error: "Complaint update is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body)
  ) {
    return NextResponse.json({ error: "A valid next status is required." }, { status: 400 });
  }

  const nextStatus = parseCaseStatus(body.status);
  const note =
    "note" in body && typeof body.note === "string" ? body.note.trim() : "";
  const completionNotes =
    "completionNotes" in body && typeof body.completionNotes === "string"
      ? body.completionNotes.trim()
      : undefined;
  const wasteCollectedKg =
    "wasteCollectedKg" in body && typeof body.wasteCollectedKg === "number"
      ? body.wasteCollectedKg
      : undefined;
  const assignedTeamId =
    "assignedTeamId" in body && typeof body.assignedTeamId === "string"
      ? body.assignedTeamId.trim()
      : undefined;
  const priority = "priority" in body ? parseCasePriority(body.priority) : undefined;
  if (!nextStatus || ("note" in body && body.note !== undefined &&
    (typeof body.note !== "string" || body.note.length > 1000)) ||
    ("completionNotes" in body && body.completionNotes !== undefined &&
      (typeof body.completionNotes !== "string" || body.completionNotes.length > 3000)) ||
    ("wasteCollectedKg" in body && body.wasteCollectedKg !== undefined &&
      (typeof body.wasteCollectedKg !== "number" || !Number.isFinite(body.wasteCollectedKg) ||
        body.wasteCollectedKg < 0 || body.wasteCollectedKg > 100000)) ||
    ("assignedTeamId" in body && body.assignedTeamId !== undefined &&
      (typeof body.assignedTeamId !== "string" || !body.assignedTeamId.trim() || body.assignedTeamId.length > 100)) ||
    ("priority" in body && priority === null)) {
    return NextResponse.json({ error: "Status or note is invalid." }, { status: 400 });
  }
  if (priority && user.role !== UserRole.SUPERVISOR && user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Only supervisors can set complaint priority." }, { status: 403 });
  }
  if (nextStatus === CaseStatus.REJECTED && !note) {
    return NextResponse.json({ error: "A rejection reason is required." }, { status: 400 });
  }
  if (assignedTeamId !== undefined && user.role !== UserRole.SUPERVISOR && user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Only supervisors can assign teams." }, { status: 403 });
  }
  if (assignedTeamId !== undefined && nextStatus !== CaseStatus.ASSIGNED) {
    return NextResponse.json({ error: "A team can only be assigned while assigning the complaint." }, { status: 400 });
  }
  if (
    (completionNotes !== undefined || wasteCollectedKg !== undefined) &&
    nextStatus !== CaseStatus.AWAITING_VERIFICATION
  ) {
    return NextResponse.json({ error: "Completion details can only be recorded when work is submitted for verification." }, { status: 400 });
  }
  if (
    nextStatus === CaseStatus.AWAITING_VERIFICATION &&
    !completionNotes?.trim()
  ) {
    return NextResponse.json(
      { error: "Completion notes are required for verification." },
      { status: 400 },
    );
  }

  const { trackingCode } = await params;
  try {
    const rateLimit = await consumeRateLimit(`staff-complaint-update:${user.id}`, 60, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Update request limit reached. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
    const complaint = await prisma.complaint.findUnique({
      where: { trackingCode: trackingCode.toUpperCase() },
      select: { id: true, status: true, assignedTeamId: true, priority: true, category: true },
    });
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    }
    if (nextStatus === CaseStatus.AWAITING_VERIFICATION) {
      const completionWeightError = validateCivicCompletionWeight(
        complaint.category,
        wasteCollectedKg,
      );
      if (completionWeightError) {
        return NextResponse.json({ error: completionWeightError }, { status: 400 });
      }
    }

    if (user.role === UserRole.FIELD_WORKER) {
      if (
        !complaint.assignedTeamId ||
        !(await prisma.teamMember.findUnique({
          where: { userId_teamId: { userId: user.id, teamId: complaint.assignedTeamId } },
          select: { userId: true },
        }))
      ) {
        return NextResponse.json({ error: "This complaint is not assigned to your team." }, { status: 403 });
      }
      if (
        nextStatus !== CaseStatus.IN_PROGRESS &&
        nextStatus !== CaseStatus.AWAITING_VERIFICATION
      ) {
        return NextResponse.json({ error: "Field staff cannot set that status." }, { status: 403 });
      }
    }

    if (!canTransitionCaseStatus(complaint.status, nextStatus)) {
      return NextResponse.json(
        { error: `Cannot move a complaint from ${complaint.status} to ${nextStatus}.` },
        { status: 409 },
      );
    }
    if (nextStatus === CaseStatus.ASSIGNED && !assignedTeamId && !complaint.assignedTeamId) {
      return NextResponse.json({ error: "Choose a field team before assigning this complaint." }, { status: 400 });
    }
    if (nextStatus === CaseStatus.AWAITING_VERIFICATION) {
      const afterEvidenceCount = await prisma.evidence.count({
        where: { complaintId: complaint.id, type: EvidenceType.AFTER },
      });
      if (afterEvidenceCount === 0) {
        return NextResponse.json(
          { error: "Upload a completion evidence photo before submitting for verification." },
          { status: 409 },
        );
      }
    }
    const assignedTeam = assignedTeamId
      ? await prisma.team.findUnique({
          where: { id: assignedTeamId },
          select: { id: true, departmentId: true },
        })
      : null;
    if (assignedTeamId && !assignedTeam) {
      return NextResponse.json({ error: "Selected field team was not found." }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const reopened =
        (complaint.status === CaseStatus.RESOLVED || complaint.status === CaseStatus.REJECTED) &&
        (nextStatus === CaseStatus.IN_PROGRESS || nextStatus === CaseStatus.UNDER_REVIEW);
      const resetSla = Boolean(priority) || reopened;
      const effectivePriority = priority ?? complaint.priority;
      const updateResult = await transaction.complaint.updateMany({
        where: { id: complaint.id, status: complaint.status },
        data: {
          status: nextStatus,
          resolvedAt: nextStatus === CaseStatus.RESOLVED ? new Date() : null,
          ...(priority
            ? {
                priority,
              }
            : {}),
          ...(resetSla ? { slaDueAt: getSlaDueAt(effectivePriority) } : {}),
          ...(assignedTeam
            ? { assignedTeamId: assignedTeam.id, assignedDepartmentId: assignedTeam.departmentId }
            : {}),
          ...(completionNotes !== undefined ? { notes: completionNotes.trim() } : {}),
          ...(wasteCollectedKg !== undefined ? { wasteCollectedKg } : {}),
        },
      });
      if (updateResult.count === 0) return null;
      if (resetSla) {
        await transaction.$executeRaw`
          UPDATE "Complaint"
          SET "slaEscalatedAt" = NULL
          WHERE "id" = ${complaint.id}
        `;
      }

      await transaction.complaintEvent.create({
        data: {
          complaintId: complaint.id,
          status: nextStatus,
          actorId: user.id,
          note: note || null,
        },
      });

      return transaction.complaint.findUniqueOrThrow({
        where: { id: complaint.id },
        select: {
          trackingCode: true,
          status: true,
          updatedAt: true,
          assignedTeam: { select: { id: true, name: true } },
        },
      });
    });

    if (!updated) {
      return NextResponse.json(
        { error: "This complaint changed while you were updating it. Reload and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json({ complaint: updated });
  } catch (error) {
    console.error("Failed to update complaint status:", error);
    return NextResponse.json({ error: "Unable to update complaint status." }, { status: 500 });
  }
}
