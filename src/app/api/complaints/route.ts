import { auth } from "@clerk/nextjs/server";
import { CasePriority, CaseStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { validateCitizenReportLocation } from "@/lib/chhattisgarh-boundary";
import { getSlaDueAt } from "@/lib/sla";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ complaints: [] });

    const complaints = await prisma.complaint.findMany({
      where: { reporterId: user.id },
      orderBy: { createdAt: "desc" },
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
        possibleCause: true,
        recommendedAction: true,
        evidence: {
          orderBy: { createdAt: "asc" },
          select: { id: true, type: true, mimeType: true, createdAt: true },
        },
        events: {
          orderBy: { createdAt: "asc" },
          select: { status: true, note: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({
      complaints: complaints.map((complaint) => ({
        ...complaint,
        evidence: complaint.evidence.map((item) => ({
          ...item,
          url: `/api/complaints/${encodeURIComponent(complaint.trackingCode)}/evidence/${item.id}`,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to list complaints:", error);
    return NextResponse.json({ error: "Unable to load complaints." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 16 * 1024) {
    return NextResponse.json({ error: "Complaint details are too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const title = readText(body.title, 160);
  const category = readText(body.category, 80);
  const description = readText(body.description, 5000);
  const location = readText(body.location, 180);
  const ward = body.ward === undefined || body.ward === null ? null : readText(body.ward, 80);
  const possibleCause = body.possibleCause === undefined ? null : readText(body.possibleCause, 1000);
  const recommendedAction = body.recommendedAction === undefined ? null : readText(body.recommendedAction, 1000);
  const locationValidation = validateCitizenReportLocation(
    body.latitude,
    body.longitude,
    body.citizenLatitude,
    body.citizenLongitude,
  );

  if (!title || !category || !description || !location || ward === undefined) {
    return NextResponse.json(
      { error: "Title, category, description, and location are required and must be within allowed lengths." },
      { status: 400 },
    );
  }
  if (body.priority !== undefined) {
    return NextResponse.json(
      { error: "Complaint priority is assigned by municipal staff after review." },
      { status: 400 },
    );
  }
  if (
    (body.possibleCause !== undefined && possibleCause === null) ||
    (body.recommendedAction !== undefined && recommendedAction === null)
  ) {
    return NextResponse.json(
      { error: "AI triage details must be text within allowed lengths." },
      { status: 400 },
    );
  }
  if (!locationValidation.ok) {
    return NextResponse.json(
      { error: locationValidation.error },
      { status: locationValidation.status },
    );
  }
  const { latitude, longitude } = locationValidation;

  try {
    const rateLimit = await consumeRateLimit(`complaints-create:${userId}`, 5, 10 * 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Complaint submission limit reached. Try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
    const reporter = await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: {},
      create: { clerkUserId: userId },
      select: { id: true },
    });

    const complaint = await prisma.complaint.create({
      data: {
        trackingCode: `WL-${new Date().getFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
        title,
        category,
        description,
        location,
        ward,
        latitude,
        longitude,
        priority: CasePriority.MEDIUM,
        slaDueAt: getSlaDueAt(CasePriority.MEDIUM),
        possibleCause,
        recommendedAction,
        reporterId: reporter.id,
        status: CaseStatus.SUBMITTED,
        events: {
          create: {
            status: CaseStatus.SUBMITTED,
            note: "Complaint submitted.",
            actor: { connect: { id: reporter.id } },
          },
        },
      },
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
        possibleCause: true,
        recommendedAction: true,
      },
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (error) {
    console.error("Failed to create complaint:", error);
    return NextResponse.json({ error: "Unable to save complaint." }, { status: 500 });
  }
}
