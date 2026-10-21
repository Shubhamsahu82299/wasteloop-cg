import assert from "node:assert/strict";
import test from "node:test";
import {
  isWithinChhattisgarh,
  validateCitizenReportLocation,
} from "../src/lib/chhattisgarh-boundary.ts";

test("accepts GPS coordinates in Chhattisgarh cities", () => {
  assert.equal(isWithinChhattisgarh(21.2514, 81.6296), true, "Raipur");
  assert.equal(isWithinChhattisgarh(22.0797, 82.1409), true, "Bilaspur");
  assert.equal(isWithinChhattisgarh(19.0748, 82.008), true, "Jagdalpur");
  assert.equal(isWithinChhattisgarh(22.3595, 82.7501), true, "Korba");
  assert.equal(isWithinChhattisgarh(23.1167, 83.2), true, "Ambikapur");
});

test("rejects GPS coordinates outside Chhattisgarh and invalid coordinates", () => {
  assert.equal(isWithinChhattisgarh(21.1458, 79.0882), false, "Nagpur");
  assert.equal(isWithinChhattisgarh(17.385, 78.4867), false, "Hyderabad");
  assert.equal(isWithinChhattisgarh(Number.NaN, 81.6), false);
  assert.equal(isWithinChhattisgarh(21.2, Number.POSITIVE_INFINITY), false);
});

test("requires matching citizen and complaint-site GPS coordinates inside the state", () => {
  assert.deepEqual(
    validateCitizenReportLocation(21.2514, 81.6296, 21.2514, 81.6296),
    { ok: true, latitude: 21.2514, longitude: 81.6296 },
  );
  assert.equal(validateCitizenReportLocation(null, 81.6, null, 81.6).status, 400);
  assert.equal(validateCitizenReportLocation(21.25, 81.6, 20.7, 81.5).status, 400);
  assert.equal(validateCitizenReportLocation(21.1458, 79.0882, 21.1458, 79.0882).status, 422);
  assert.equal(validateCitizenReportLocation(91, 81.6, 91, 81.6).status, 400);
});
