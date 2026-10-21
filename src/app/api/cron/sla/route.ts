import { CasePriority, CaseStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hasValidBearerSecret } from "@/lib/cron-auth";
import { getEscalatedPriority } from "@/lib/sla";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const maxBatchSize = 100;

type OverdueComplaint = {
  id: string;
  status: CaseStatus;
  priority: CasePriority;
};

export async function POST(request: Request) {
  if (!hasValidBearerSecret(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  try {
    const overdue = await prisma.$queryRaw<OverdueComplaint[]>`
      SELECT "id", "status", "priority"
      FROM "Complaint"
      WHERE "status" IN (
        'SUBMITTED'::"CaseStatus",
        'UNDER_REVIEW'::"CaseStatus",
        'ASSIGNED'::"CaseStatus",
        'IN_PROGRESS'::"CaseStatus",
        'AWAITING_VERIFICATION'::"CaseStatus"
      )
        AND "priority" <> 'URGENT'::"CasePriority"
        AND "slaDueAt" <= ${now}
        AND "slaEscalatedAt" IS NULL
      ORDER BY "slaDueAt" ASC, "createdAt" ASC
      LIMIT ${maxBatchSize}
    `;

    let escalated = 0;
    for (const complaint of overdue) {
      const nextPriority = getEscalatedPriority(complaint.priority);
      if (!nextPriority) continue;

      const wasEscalated = await prisma.$transaction(async (transaction) => {
        const updatedCount = await transaction.$executeRaw`
          UPDATE "Complaint"
          SET "priority" = ${nextPriority}::"CasePriority",
            "slaEscalatedAt" = ${now},
            "updatedAt" = ${now}
          WHERE "id" = ${complaint.id}
            AND "status" = ${complaint.status}::"CaseStatus"
            AND "priority" = ${complaint.priority}::"CasePriority"
            AND "slaDueAt" <= ${now}
            AND "slaEscalatedAt" IS NULL
        `;
        if (updatedCount === 0) return false;

        await transaction.complaintEvent.create({
          data: {
            complaintId: complaint.id,
            status: complaint.status,
            note: `SLA deadline exceeded; priority escalated to ${nextPriority}.`,
          },
        });
        return true;
      });
      if (wasEscalated) escalated++;
    }

    return NextResponse.json({
      processed: overdue.length,
      escalated,
      hasMore: overdue.length === maxBatchSize,
    });
  } catch (error) {
    console.error("SLA escalation job failed:", error);
    return NextResponse.json({ error: "SLA escalation is temporarily unavailable." }, { status: 503 });
  }
}
