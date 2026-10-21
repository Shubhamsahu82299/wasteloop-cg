import assert from "node:assert/strict";
import test from "node:test";
import { hasValidBearerSecret } from "../src/lib/cron-auth.ts";

const secret = "0123456789abcdef0123456789abcdef";

test("accepts the configured bearer secret", () => {
  assert.equal(hasValidBearerSecret(`Bearer ${secret}`, secret), true);
});

test("rejects missing, malformed, weak, and incorrect cron credentials", () => {
  assert.equal(hasValidBearerSecret(null, secret), false);
  assert.equal(hasValidBearerSecret(`Basic ${secret}`, secret), false);
  assert.equal(hasValidBearerSecret("Bearer short", "short"), false);
  assert.equal(hasValidBearerSecret(`Bearer ${"a".repeat(32)}`, secret), false);
  assert.equal(hasValidBearerSecret(`Bearer ${secret}`, undefined), false);
});
