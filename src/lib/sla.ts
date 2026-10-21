import { CasePriority } from "@prisma/client";

const slaHours: Record<CasePriority, number> = {
  [CasePriority.URGENT]: 4,
  [CasePriority.HIGH]: 24,
  [CasePriority.MEDIUM]: 72,
  [CasePriority.LOW]: 120,
};

const escalationPriority: Partial<Record<CasePriority, CasePriority>> = {
  [CasePriority.LOW]: CasePriority.MEDIUM,
  [CasePriority.MEDIUM]: CasePriority.HIGH,
  [CasePriority.HIGH]: CasePriority.URGENT,
};

export function getSlaDueAt(priority: CasePriority, from = new Date()): Date {
  return new Date(from.getTime() + slaHours[priority] * 60 * 60 * 1000);
}

export function getEscalatedPriority(priority: CasePriority): CasePriority | null {
  return escalationPriority[priority] ?? null;
}
