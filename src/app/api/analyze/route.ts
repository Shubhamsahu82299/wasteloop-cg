import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Operational analysis is not implemented. Use the supported AI triage endpoint." },
    { status: 501 },
  );
}
