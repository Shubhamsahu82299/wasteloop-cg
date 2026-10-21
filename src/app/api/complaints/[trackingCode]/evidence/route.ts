import { EvidenceType, UserRole } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentAppUser } from "@/lib/current-app-user";
import {
  createEvidenceObjectKey,
  deleteEvidenceObject,
  ObjectStorageConfigurationError,
  putEvidenceObject,
} from "@/lib/object-storage";
import { detectEvidenceMimeType, MAX_EVIDENCE_SIZE_BYTES } from "@/lib/evidence-file";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const maxRequestSize = MAX_EVIDENCE_SIZE_BYTES + 64 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ trackingCode: string }> },
) {
  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxRequestSize) {
    return NextResponse.json({ error: "Evidence image must be 4 MB or smaller." }, { status: 413 });
  }
  try {
    const rateLimit = await consumeRateLimit(`evidence-upload:${user.id}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Evidence upload limit reached. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
  } catch (error) {
    console.error("Evidence upload rate limit check failed:", error);
    return NextResponse.json({ error: "Evidence upload is temporarily unavailable." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Provide a valid multipart image upload." }, { status: 400 });
  }

  const file = formData.get("file");
  const evidenceType = formData.get("type");
  if (!(file instanceof File) || file.size < 1 || file.size > MAX_EVIDENCE_SIZE_BYTES) {
    return NextResponse.json({ error: "Evidence image must be between 1 byte and 4 MB." }, { status: 400 });
  }
  if (evidenceType !== "BEFORE" && evidenceType !== "AFTER") {
    return NextResponse.json({ error: "Evidence type must be BEFORE or AFTER." }, { status: 400 });
  }

  const imageBytes = new Uint8Array(await file.arrayBuffer());
  const detectedMimeType = detectEvidenceMimeType(imageBytes);
  if (!detectedMimeType || file.type !== detectedMimeType) {
    return NextResponse.json(
      { error: "Only valid JPEG, PNG, or WebP images are accepted." },
      { status: 400 },
    );
  }
  let sanitizedImage: Buffer;
  try {
    const image = sharp(imageBytes, { limitInputPixels: 40_000_000 });
    const metadata = await image.metadata();
    if (
      (metadata.format === "jpeg" ? "image/jpeg" : `image/${metadata.format}`) !== detectedMimeType
    ) {
      return NextResponse.json({ error: "Image content does not match its file type." }, { status: 400 });
    }
    sanitizedImage = await sharp(imageBytes, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Image file could not be decoded." }, { status: 400 });
  }

  const { trackingCode } = await params;
  const complaint = await prisma.complaint.findUnique({
    where: { trackingCode: trackingCode.toUpperCase() },
    select: {
      id: true,
      status: true,
      assignedTeamId: true,
      reporter: { select: { clerkUserId: true } },
    },
  });
  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
  }

  let allowed = false;
  if (user.role === UserRole.CITIZEN) {
    allowed =
      evidenceType === EvidenceType.BEFORE &&
      complaint.reporter.clerkUserId === user.clerkUserId &&
      (complaint.status === "SUBMITTED" || complaint.status === "UNDER_REVIEW");
  } else if (user.role === UserRole.FIELD_WORKER) {
    allowed =
      evidenceType === EvidenceType.AFTER &&
      complaint.status === "IN_PROGRESS" &&
      Boolean(
        complaint.assignedTeamId &&
          (await prisma.teamMember.findUnique({
            where: {
              userId_teamId: { userId: user.id, teamId: complaint.assignedTeamId },
            },
            select: { userId: true },
          })),
      );
  }

  if (!allowed) {
    return NextResponse.json({ error: "You cannot upload this evidence for the complaint." }, { status: 403 });
  }

  const key = createEvidenceObjectKey(complaint.id, evidenceType, "image/jpeg");
  try {
    await putEvidenceObject(key, sanitizedImage, "image/jpeg");
  } catch (error) {
    if (error instanceof ObjectStorageConfigurationError) {
      return NextResponse.json({ error: "Evidence storage is not configured." }, { status: 503 });
    }
    console.error("Failed to upload complaint evidence:", error);
    return NextResponse.json({ error: "Unable to store complaint evidence." }, { status: 503 });
  }

  try {
    const evidenceId = randomUUID();
    const [evidence] = await prisma.$queryRaw<
      { id: string; type: EvidenceType; mimeType: string; createdAt: Date }[]
    >`
      INSERT INTO "Evidence" ("id", "complaintId", "uploadedById", "type", "objectKey", "mimeType")
      VALUES (
        ${evidenceId},
        ${complaint.id},
        ${user.id},
        CAST(${evidenceType} AS "EvidenceType"),
        ${key},
        'image/jpeg'
      )
      RETURNING "id", "type", "mimeType", "createdAt"
    `;

    return NextResponse.json(
      {
        evidence: {
          ...evidence,
          url: `/api/complaints/${encodeURIComponent(trackingCode.toUpperCase())}/evidence/${evidence.id}`,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    try {
      await deleteEvidenceObject(key);
    } catch (cleanupError) {
      console.error("Failed to remove orphaned complaint evidence:", cleanupError);
    }
    console.error("Failed to save complaint evidence metadata:", error);
    return NextResponse.json({ error: "Unable to save complaint evidence." }, { status: 500 });
  }
}
