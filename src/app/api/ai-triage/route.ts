import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenAI, type PartUnion } from "@google/genai";
import { consumeRateLimit } from "@/lib/rate-limit";
import { detectEvidenceMimeType, MAX_EVIDENCE_SIZE_BYTES } from "@/lib/evidence-file";
import { isWithinChhattisgarh } from "@/lib/chhattisgarh-boundary";
import { civicIssueCategories } from "@/lib/civic-issues";

const MAX_REQUEST_BYTES = 6 * 1024 * 1024;
export const runtime = "nodejs";

const categories: string[] = civicIssueCategories.map((issue) => issue.value);
const priorities = ["Urgent", "High", "Medium", "Low"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ success: false, error: "AI triage is not configured." }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ success: false, error: "AI triage request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    if (!isRecord(body)) {
      return NextResponse.json({ success: false, error: "Request body must be an object." }, { status: 400 });
    }
    if (body.aiConsent !== true) {
      return NextResponse.json(
        { success: false, error: "Consent is required for external AI triage." },
        { status: 400 },
      );
    }
    const {
      photoBase64,
      description,
      location,
      category,
      latitude,
      longitude,
      citizenLatitude,
      citizenLongitude,
    } = body;
    if (
      typeof description !== "string" ||
      description.trim().length < 8 ||
      description.length > 5000 ||
      typeof location !== "string" ||
      location.length > 180 ||
      typeof category !== "string" ||
      category.length > 80 ||
      (photoBase64 !== undefined && typeof photoBase64 !== "string") ||
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      typeof citizenLatitude !== "number" ||
      !Number.isFinite(citizenLatitude) ||
      typeof citizenLongitude !== "number" ||
      !Number.isFinite(citizenLongitude)
    ) {
      return NextResponse.json({ success: false, error: "AI triage request fields are invalid." }, { status: 400 });
    }
    if (latitude !== citizenLatitude || longitude !== citizenLongitude) {
      return NextResponse.json(
        { success: false, error: "Use the same fresh GPS location for the citizen and report site." },
        { status: 400 },
      );
    }
    if (!isWithinChhattisgarh(latitude, longitude)) {
      return NextResponse.json(
        { success: false, error: "AI triage is available only for reports from Chhattisgarh." },
        { status: 422 },
      );
    }
    if (
      typeof photoBase64 === "string" &&
      (!photoBase64.startsWith("data:image/") ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(photoBase64))
    ) {
      return NextResponse.json({ success: false, error: "Provide a valid JPEG, PNG, or WebP image." }, { status: 400 });
    }
    if (typeof photoBase64 === "string") {
      const mimeType = photoBase64.slice(photoBase64.indexOf(":") + 1, photoBase64.indexOf(";"));
      const imageBytes = Buffer.from(photoBase64.slice(photoBase64.indexOf(",") + 1), "base64");
      if (
        imageBytes.byteLength > MAX_EVIDENCE_SIZE_BYTES ||
        detectEvidenceMimeType(imageBytes) !== mimeType
      ) {
        return NextResponse.json({ success: false, error: "Image content is invalid or exceeds 4 MB." }, { status: 400 });
      }
    }
    let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>>;
    try {
      rateLimit = await consumeRateLimit(`ai-triage:${userId}`, 10, 60_000);
    } catch (error) {
      console.error("AI triage rate limit check failed:", error);
      return NextResponse.json({ success: false, error: "AI triage is temporarily unavailable." }, { status: 503 });
    }
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "AI triage request limit reached. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const prompt = `You are a civic-service triage assistant for Chhattisgarh, India (WasteLoop CG).
A citizen has reported a public-service or civic issue:
- Locality: ${location}
- User Category Hint: ${category}
- Description / Voice Note: ${description.trim()}

Classify the report using exactly one category from this list: ${categories.join(" | ")}.
Suggest safe, practical next steps for the responsible public-service team. Do not claim that a department or team has been assigned, do not invent government policy, and do not provide emergency response instructions. Treat an immediate threat to life or safety as urgent.
Return STRICTLY a valid JSON object (no markdown, no backticks, just raw JSON) with this schema:
{
  "category": string (one exact category from the allowed list),
  "priority": "Urgent" | "High" | "Medium" | "Low",
  "slaHours": number,
  "summary": string (clean 1-line summary),
  "possibleCause": string,
  "actionSteps": string[] (3 to 4 actionable steps for field team)
}`;

    const parts: PartUnion[] = [{ text: prompt }];

    // If base64 photo provided, attach as inline image part
    if (typeof photoBase64 === "string") {
      const mimeType = photoBase64.substring(photoBase64.indexOf(":") + 1, photoBase64.indexOf(";"));
      const base64Data = photoBase64.split("base64,")[1];
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: parts,
    });

    const rawText = response.text || "";
    const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed: unknown = JSON.parse(cleanedJson);
    if (
      !isRecord(parsed) ||
      typeof parsed.category !== "string" ||
      !categories.includes(parsed.category) ||
      typeof parsed.priority !== "string" ||
      !priorities.includes(parsed.priority) ||
      typeof parsed.slaHours !== "number" ||
      !Number.isFinite(parsed.slaHours) ||
      parsed.slaHours < 1 ||
      parsed.slaHours > 720 ||
      typeof parsed.summary !== "string" ||
      parsed.summary.trim().length < 1 ||
      parsed.summary.length > 180 ||
      typeof parsed.possibleCause !== "string" ||
      parsed.possibleCause.length > 500 ||
      !Array.isArray(parsed.actionSteps) ||
      parsed.actionSteps.length < 3 ||
      parsed.actionSteps.length > 4 ||
      !parsed.actionSteps.every((step) => typeof step === "string" && step.length > 0 && step.length <= 300)
    ) {
      throw new Error("AI triage returned data outside the expected schema.");
    }

    return NextResponse.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error("Gemini AI Triage Error:", error);
    return NextResponse.json({
      success: false,
      error: "AI triage is currently unavailable.",
    }, { status: 503 });
  }
}
