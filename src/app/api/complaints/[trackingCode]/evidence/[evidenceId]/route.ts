import { UserRole } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { getEvidenceObject, ObjectStorageConfigurationError } from "@/lib/object-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trackingCode: string; evidenceId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { trackingCode, evidenceId } = await params;
  const [evidence] = await prisma.$queryRaw<
    {
      objectKey: string;
      mimeType: string | null;
      reporterClerkUserId: string;
      assignedTeamId: string | null;
    }[]
  >`
    SELECT
      e."objectKey",
      e."mimeType",
      reporter."clerkUserId" AS "reporterClerkUserId",
      complaint."assignedTeamId"
    FROM "Evidence" e
    INNER JOIN "Complaint" complaint ON complaint."id" = e."complaintId"
    INNER JOIN "User" reporter ON reporter."id" = complaint."reporterId"
    WHERE e."id" = ${evidenceId}
      AND complaint."trackingCode" = ${trackingCode.toUpperCase()}
    LIMIT 1
  `;
  if (!evidence) {
    return NextResponse.json({ error: "Evidence not found." }, { status: 404 });
  }

  const user = await getCurrentAppUser();
  let allowed = user?.role === UserRole.SUPERVISOR || user?.role === UserRole.ADMIN;
  if (user?.role === UserRole.CITIZEN) {
    allowed = evidence.reporterClerkUserId === userId;
  } else if (user?.role === UserRole.FIELD_WORKER && evidence.assignedTeamId) {
    allowed = Boolean(
      await prisma.teamMember.findUnique({
        where: {
          userId_teamId: { userId: user.id, teamId: evidence.assignedTeamId },
        },
        select: { userId: true },
      }),
    );
  }
  if (!allowed || !user) {
    return NextResponse.json({ error: "You cannot view this evidence." }, { status: 403 });
  }

  try {
    const storedObject = await getEvidenceObject(evidence.objectKey);
    if (!storedObject.Body) {
      return NextResponse.json({ error: "Evidence file is unavailable." }, { status: 404 });
    }
    const bytes = Buffer.from(await storedObject.Body.transformToByteArray());

    return new Response(bytes, {
      headers: {
        "Content-Type": evidence.mimeType ?? "application/octet-stream",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof ObjectStorageConfigurationError) {
      return NextResponse.json({ error: "Evidence storage is not configured." }, { status: 503 });
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "$metadata" in error &&
      typeof error.$metadata === "object" &&
      error.$metadata !== null &&
      "httpStatusCode" in error.$metadata &&
      error.$metadata.httpStatusCode === 404
    ) {
      return NextResponse.json({ error: "Evidence file is unavailable." }, { status: 404 });
    }
    console.error("Failed to retrieve complaint evidence:", error);
    return NextResponse.json({ error: "Unable to retrieve complaint evidence." }, { status: 503 });
  }
}
