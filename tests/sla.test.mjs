import assert from "node:assert/strict";
import test from "node:test";
import { CasePriority } from "@prisma/client";
import { getEscalatedPriority, getSlaDueAt } from "../src/lib/sla.ts";

test("assigns priority-specific deadlines from the provided time", () => {
  const start = new Date("2026-01-01T00:00:00.000Z");

  assert.equal(getSlaDueAt(CasePriority.URGENT, start).toISOString(), "2026-01-01T04:00:00.000Z");
  assert.equal(getSlaDueAt(CasePriority.HIGH, start).toISOString(), "2026-01-02T00:00:00.000Z");
  assert.equal(getSlaDueAt(CasePriority.MEDIUM, start).toISOString(), "2026-01-04T00:00:00.000Z");
  assert.equal(getSlaDueAt(CasePriority.LOW, start).toISOString(), "2026-01-06T00:00:00.000Z");
});

test("escalates overdue cases by one level and does not escalate urgent cases", () => {
  assert.equal(getEscalatedPriority(CasePriority.LOW), CasePriority.MEDIUM);
  assert.equal(getEscalatedPriority(CasePriority.MEDIUM), CasePriority.HIGH);
  assert.equal(getEscalatedPriority(CasePriority.HIGH), CasePriority.URGENT);
  assert.equal(getEscalatedPriority(CasePriority.URGENT), null);
});
