import { auth } from "@clerk/nextjs/server";
import { CaseStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ trackingCode: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 4 * 1024) {
    return NextResponse.json({ error: "Feedback details are too large." }, { status: 413 });
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
    !("resolved" in body) ||
    typeof body.resolved !== "boolean" ||
    ("comment" in body && body.comment !== undefined &&
      (typeof body.comment !== "string" || body.comment.trim().length > 1000))
  ) {
    return NextResponse.json({ error: "Provide a resolution result and an optional comment up to 1000 characters." }, { status: 400 });
  }

  const { trackingCode } = await params;

  try {
    const rateLimit = await consumeRateLimit(`complaint-feedback:${userId}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Feedback request limit reached. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
    const complaint = await prisma.complaint.findFirst({
      where: {
        trackingCode: trackingCode.toUpperCase(),
        reporter: { clerkUserId: userId },
      },
      select: { id: true, status: true },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    }
    if (
      complaint.status !== CaseStatus.AWAITING_VERIFICATION &&
      complaint.status !== CaseStatus.RESOLVED
    ) {
      return NextResponse.json(
        { error: "Feedback is available after the field team submits work for verification." },
        { status: 409 },
      );
    }

    const resolved = body.resolved;
    const nextStatus = resolved ? CaseStatus.RESOLVED : CaseStatus.IN_PROGRESS;
    const comment =
      "comment" in body && typeof body.comment === "string" ? body.comment.trim() || null : null;

    const saved = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUniqueOrThrow({
        where: { clerkUserId: userId },
        select: { id: true },
      });
      const updated = await transaction.complaint.updateMany({
        where: { id: complaint.id, status: complaint.status },
        data: {
          status: nextStatus,
          resolvedAt: resolved ? new Date() : null,
        },
      });
      if (updated.count === 0) return false;

      await transaction.citizenFeedback.upsert({
        where: { complaintId: complaint.id },
        create: { complaintId: complaint.id, userId: user.id, resolved, comment },
        update: { resolved, comment },
      });
      await transaction.complaintEvent.create({
        data: {
          complaintId: complaint.id,
          status: nextStatus,
          actorId: user.id,
          note: resolved
            ? comment ?? "Citizen confirmed resolution."
            : comment ?? "Citizen requested reinspection.",
        },
      });
      return true;
    });
    if (!saved) {
      return NextResponse.json(
        { error: "This complaint changed while you were submitting feedback. Reload and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json({ status: nextStatus });
  } catch (error) {
    console.error("Failed to submit complaint feedback:", error);
    return NextResponse.json({ error: "Unable to save feedback." }, { status: 500 });
  }
}
