import { CaseItem, CaseStatus, Priority } from "@/app/types";

export type StaffComplaintRecord = {
  trackingCode: string;
  title: string;
  category: string;
  description: string;
  location: string;
  ward: string | null;
  latitude: number | null;
  longitude: number | null;
  priority: string;
  status: string;
  slaDueAt?: string | null;
  slaOverdue?: boolean;
  createdAt: string;
  updatedAt?: string;
  possibleCause?: string | null;
  recommendedAction?: string | null;
  assignedDepartment?: { id: string; name: string } | null;
  assignedTeam?: { id: string; name: string } | null;
  events: { status: string; note: string | null; createdAt: string }[];
  evidence?: {
    type: string;
    url: string;
    mimeType: string | null;
    createdAt: string;
  }[];
  feedback?: { resolved: boolean; comment: string | null; createdAt: string } | null;
  wasteCollectedKg?: number | null;
  notes?: string | null;
};

const statusLabels: Record<string, CaseStatus> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  AWAITING_VERIFICATION: "Awaiting Verification",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

const priorityLabels: Record<string, Priority> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN");
}

export function toStaffCase(record: StaffComplaintRecord): CaseItem {
  const beforeEvidence = record.evidence?.find((item) => item.type === "BEFORE");
  const afterEvidence = record.evidence?.find((item) => item.type === "AFTER");
  const status = statusLabels[record.status] ?? "Submitted";

  return {
    id: `#${record.trackingCode}`,
    title: record.title,
    category: record.category,
    description: record.description,
    location: record.location,
    latitude: record.latitude,
    longitude: record.longitude,
    ward: record.ward ?? "",
    priority: priorityLabels[record.priority] ?? "Medium",
    status,
    slaDueAt: record.slaDueAt ?? null,
    slaOverdue: record.slaOverdue ?? false,
    time: formatDate(record.updatedAt ?? record.createdAt),
    createdAt: formatDate(record.createdAt),
    photoUrl: beforeEvidence?.url ?? "",
    afterPhotoUrl: afterEvidence?.url,
    possibleCause: record.possibleCause ?? undefined,
    recommendedDepartment: record.assignedTeam?.name ?? record.assignedDepartment?.name,
    assignedTeamId: record.assignedTeam?.id,
    suggestedAction: record.recommendedAction ?? undefined,
    steps: record.recommendedAction?.split("\n").filter(Boolean),
    wasteCollectedKg: record.wasteCollectedKg ?? undefined,
    notes: record.notes ?? undefined,
    feedback: record.feedback
      ? { resolved: record.feedback.resolved, comment: record.feedback.comment ?? undefined }
      : undefined,
    timeline: record.events.map((event) => ({
      status: statusLabels[event.status] ?? event.status,
      timestamp: formatDate(event.createdAt),
      completed: true,
      subtext: event.note ?? undefined,
    })),
  };
}
