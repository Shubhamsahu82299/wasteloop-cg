import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type Analysis = {
  summary: string;
  category: string;
  possibleCause: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  priorityReason: string;
  department: string;
  recommendedAction: string;
  workOrder: string;
  resources: string[];
  safetyChecklist: string[];
  successCriteria: string[];
  preventionPlan: string;
  confidence: number;
  similarCaseIds: string[];
  demo: true;
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { description?: string; category?: string; location?: string };
    const description = body.description?.trim();
    const categoryHint = body.category?.trim().toLowerCase() || "";
    const location = body.location?.trim() || "reported location";
    if (!description || description.length < 8) {
      return NextResponse.json({ error: "Please provide more detail about the issue." }, { status: 400 });
    }

    const text = description.toLowerCase();
    let analysis: Analysis;
    if (/burn|smoke|fire|jal/.test(text) || categoryHint.includes("burning")) {
      analysis = {
        summary: `Open burning is reported near ${location}, with potential smoke exposure.`,
        category: "Open burning",
        possibleCause: "Mixed waste is being burned at an informal disposal point.",
        priority: "Urgent",
        priorityReason: "Smoke exposure and possible fire spread require prompt human review.",
        department: "Environmental enforcement",
        recommendedAction: "Inspect the site, stop active burning, and document safe clearance.",
        workOrder: "Inspect burn site and document safe clearance",
        resources: ["Respirator masks", "Fire extinguisher", "Evidence camera"],
        safetyChecklist: ["Keep distance from smoke", "Check for live embers", "Avoid entering traffic lane"],
        successCriteria: ["No active burning", "Waste removed safely", "Before/after evidence uploaded"],
        preventionPlan: "Coordinate an awareness visit and review nearby collection coverage.",
        confidence: 86,
        similarCaseIds: ["WL-24017"],
        demo: true,
      };
    } else if (/drain|flood|water collect|paani|rain|barish/.test(text) || categoryHint.includes("drain")) {
      analysis = {
        summary: `Standing water or a blocked drain is reported near ${location}.`,
        category: "Blocked drain",
        possibleCause: "Leaves, silt, or mixed waste are obstructing stormwater flow.",
        priority: "High",
        priorityReason: "Standing water can affect traffic, hygiene, and nearby homes.",
        department: "Drain response team",
        recommendedAction: "Clear the inlet, inspect downstream flow, and document the restored channel.",
        workOrder: "Clear blocked drain and document flow",
        resources: ["Drain rod", "Silt rake", "PPE and cones"],
        safetyChecklist: ["Place traffic cones", "Wear gloves and boots", "Check water depth before entry"],
        successCriteria: ["Water drains freely", "Inlet is visibly clear", "After photo uploaded"],
        preventionPlan: "Schedule a pre-monsoon inlet inspection for this service lane.",
        confidence: 91,
        similarCaseIds: ["WL-24012"],
        demo: true,
      };
    } else if (/leak|tap|pipe|handpump|water wastage|nal/.test(text) || categoryHint.includes("water leakage")) {
      analysis = {
        summary: `A water leakage issue is reported near ${location}.`,
        category: "Water wastage",
        possibleCause: "A worn valve, loose fitting, or damaged water connection.",
        priority: "High",
        priorityReason: "The leak wastes treated water and may create a slippery public path.",
        department: "Water services",
        recommendedAction: "Repair the fitting and capture a dry-area verification photo.",
        workOrder: "Repair water leakage and verify dry area",
        resources: ["Valve kit", "Wrench set", "Warning sign"],
        safetyChecklist: ["Keep path accessible", "Control standing water", "Use hand protection"],
        successCriteria: ["No visible leak", "Path is dry and safe", "Verification photo uploaded"],
        preventionPlan: "Add public water points in this ward to a quarterly inspection route.",
        confidence: 89,
        similarCaseIds: ["WL-23987"],
        demo: true,
      };
    } else if (/garbage|waste|trash|dump|collection|kachra|kachre/.test(text) || categoryHint.includes("garbage") || categoryHint.includes("dumping")) {
      analysis = {
        summary: `A waste collection or dumping issue is reported near ${location}.`,
        category: "Missed collection",
        possibleCause: "Collection route delay, overflow, or an informal dumping point.",
        priority: "Medium",
        priorityReason: "The issue affects sanitation and should be routed to the local collection team.",
        department: "Zone sanitation",
        recommendedAction: "Inspect the point, remove accumulated waste, and check the collection route.",
        workOrder: "Inspect point and complete sanitation recovery",
        resources: ["Collection vehicle", "Route log", "Protective gloves"],
        safetyChecklist: ["Use reflective vest", "Keep residents clear of vehicle", "Avoid sharps without tools"],
        successCriteria: ["Waste removed", "Point is safe", "Route log updated"],
        preventionPlan: "Compare repeat reports with the collection schedule each week.",
        confidence: 84,
        similarCaseIds: ["WL-23998"],
        demo: true,
      };
    } else {
      analysis = {
        summary: `An environmental service issue is reported near ${location}.`,
        category: "Environmental issue",
        possibleCause: "Local service disruption or repeated activity in the reported area.",
        priority: "Medium",
        priorityReason: "A field inspection is needed to confirm the issue and route it correctly.",
        department: "Zone sanitation team",
        recommendedAction: "Inspect the site, document conditions, and complete the appropriate service action.",
        workOrder: "Inspect site and resolve reported issue",
        resources: ["Field photo evidence", "Gloves and visibility vest"],
        safetyChecklist: ["Stay clear of traffic", "Use protective equipment"],
        successCriteria: ["Issue is no longer visible", "Before/after evidence is uploaded"],
        preventionPlan: "Track repeat reports in this ward and review the service route if the issue recurs.",
        confidence: 76,
        similarCaseIds: [],
        demo: true,
      };
    }

    return NextResponse.json(analysis, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Invalid analysis request." }, { status: 400 });
  }
}
