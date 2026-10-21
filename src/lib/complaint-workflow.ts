import { CasePriority, CaseStatus } from "@prisma/client";

const transitions: Record<CaseStatus, CaseStatus[]> = {
  [CaseStatus.SUBMITTED]: [CaseStatus.UNDER_REVIEW, CaseStatus.REJECTED],
  [CaseStatus.UNDER_REVIEW]: [CaseStatus.ASSIGNED, CaseStatus.REJECTED],
  [CaseStatus.ASSIGNED]: [CaseStatus.IN_PROGRESS, CaseStatus.REJECTED],
  [CaseStatus.IN_PROGRESS]: [CaseStatus.AWAITING_VERIFICATION],
  [CaseStatus.AWAITING_VERIFICATION]: [CaseStatus.RESOLVED, CaseStatus.IN_PROGRESS],
  [CaseStatus.RESOLVED]: [CaseStatus.IN_PROGRESS],
  [CaseStatus.REJECTED]: [CaseStatus.UNDER_REVIEW],
};

export function parseCaseStatus(value: unknown): CaseStatus | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replaceAll(" ", "_");
  return Object.values(CaseStatus).find((status) => status === normalized) ?? null;
}

export function parseCasePriority(value: unknown): CasePriority | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return Object.values(CasePriority).find((priority) => priority === normalized) ?? null;
}

export function canTransitionCaseStatus(current: CaseStatus, next: CaseStatus): boolean {
  return transitions[current].includes(next);
}
