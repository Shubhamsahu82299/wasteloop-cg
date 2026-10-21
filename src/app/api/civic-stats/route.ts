import { auth } from "@clerk/nextjs/server";
import { CaseStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const [total, resolved, groupedCategories] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: CaseStatus.RESOLVED } }),
      prisma.complaint.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
    ]);

    const categories = groupedCategories
      .map(({ category, _count }) => ({ category, count: _count._all }))
      .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category))
      .slice(0, 4);

    return NextResponse.json(
      { total, resolved, categories },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load civic activity statistics:", error);
    return NextResponse.json(
      { error: "Unable to load civic activity statistics." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
