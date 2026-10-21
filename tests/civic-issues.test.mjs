import assert from "node:assert/strict";
import test from "node:test";
import {
  civicIssueCategories,
  isWasteRelatedCivicIssue,
  validateCivicCompletionWeight,
} from "../src/lib/civic-issues.ts";

test("offers a varied Chhattisgarh civic issue taxonomy with service suggestions", () => {
  const values = civicIssueCategories.map((issue) => issue.value);

  assert.equal(new Set(values).size, values.length);
  assert.ok(values.length >= 12);
  assert.ok(values.includes("Drinking Water & Supply"));
  assert.ok(values.includes("Roads, Potholes & Footpaths"));
  assert.ok(values.includes("Ration & Public Distribution"));
  assert.ok(civicIssueCategories.every((issue) =>
    issue.service.length > 0 && issue.labelHi.length > 0 && issue.labelCg.length > 0
  ));
});

test("requires waste weight for waste issues but not other civic services", () => {
  assert.equal(isWasteRelatedCivicIssue("Waste & Public Cleanliness"), true);
  assert.equal(isWasteRelatedCivicIssue("Garbage Pile"), true);
  assert.equal(isWasteRelatedCivicIssue("Construction Waste"), true);
  assert.equal(isWasteRelatedCivicIssue("Drinking Water & Supply"), false);
  assert.equal(isWasteRelatedCivicIssue("Pensions & Welfare Schemes"), false);
});

test("validates completion weight only for waste-related complaints", () => {
  assert.match(
    validateCivicCompletionWeight("Waste & Public Cleanliness", undefined),
    /Record the collected waste weight/,
  );
  assert.equal(
    validateCivicCompletionWeight("Waste & Public Cleanliness", 0),
    null,
  );
  assert.equal(
    validateCivicCompletionWeight("Drinking Water & Supply", undefined),
    null,
  );
  assert.match(
    validateCivicCompletionWeight("Drinking Water & Supply", 12),
    /only applies to waste-related complaints/,
  );
});
