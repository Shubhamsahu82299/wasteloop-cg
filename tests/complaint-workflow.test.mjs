import assert from "node:assert/strict";
import test from "node:test";
import { CasePriority, CaseStatus } from "@prisma/client";
import {
  canTransitionCaseStatus,
  parseCasePriority,
  parseCaseStatus,
} from "../src/lib/complaint-workflow.ts";

test("allows only configured complaint status transitions", () => {
  const allowed = [
    [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW],
    [CaseStatus.SUBMITTED, CaseStatus.REJECTED],
    [CaseStatus.UNDER_REVIEW, CaseStatus.ASSIGNED],
    [CaseStatus.UNDER_REVIEW, CaseStatus.REJECTED],
    [CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS],
    [CaseStatus.ASSIGNED, CaseStatus.REJECTED],
    [CaseStatus.IN_PROGRESS, CaseStatus.AWAITING_VERIFICATION],
    [CaseStatus.AWAITING_VERIFICATION, CaseStatus.RESOLVED],
    [CaseStatus.AWAITING_VERIFICATION, CaseStatus.IN_PROGRESS],
    [CaseStatus.RESOLVED, CaseStatus.IN_PROGRESS],
    [CaseStatus.REJECTED, CaseStatus.UNDER_REVIEW],
  ];

  for (const [current, next] of allowed) {
    assert.equal(canTransitionCaseStatus(current, next), true, `${current} -> ${next}`);
  }

  assert.equal(canTransitionCaseStatus(CaseStatus.SUBMITTED, CaseStatus.RESOLVED), false);
  assert.equal(canTransitionCaseStatus(CaseStatus.RESOLVED, CaseStatus.ASSIGNED), false);
  assert.equal(canTransitionCaseStatus(CaseStatus.IN_PROGRESS, CaseStatus.REJECTED), false);
});

test("parses complaint statuses without accepting unknown or non-text values", () => {
  assert.equal(parseCaseStatus(" awaiting verification "), CaseStatus.AWAITING_VERIFICATION);
  assert.equal(parseCaseStatus("resolved"), CaseStatus.RESOLVED);
  assert.equal(parseCaseStatus("IN REVIEW"), null);
  assert.equal(parseCaseStatus(null), null);
  assert.equal(parseCaseStatus({ status: "RESOLVED" }), null);
});

test("parses priorities case-insensitively and rejects unsupported values", () => {
  assert.equal(parseCasePriority(" urgent "), CasePriority.URGENT);
  assert.equal(parseCasePriority("MEDIUM"), CasePriority.MEDIUM);
  assert.equal(parseCasePriority("critical"), null);
  assert.equal(parseCasePriority(1), null);
});
