import assert from "node:assert/strict";
import test from "node:test";
import {
  detectEvidenceMimeType,
  MAX_EVIDENCE_SIZE_BYTES,
} from "../src/lib/evidence-file.ts";

test("recognizes JPEG image signatures", () => {
  assert.equal(detectEvidenceMimeType(Uint8Array.from([0xff, 0xd8, 0xff])), "image/jpeg");
});

test("recognizes PNG image signatures", () => {
  assert.equal(
    detectEvidenceMimeType(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    "image/png",
  );
});

test("recognizes WebP image signatures", () => {
  assert.equal(
    detectEvidenceMimeType(
      Uint8Array.from([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50,
      ]),
    ),
    "image/webp",
  );
});

test("rejects unknown image signatures and enforces a 4 MB upload limit", () => {
  assert.equal(detectEvidenceMimeType(Uint8Array.from([0x3c, 0x73, 0x76, 0x67])), null);
  assert.equal(MAX_EVIDENCE_SIZE_BYTES, 4 * 1024 * 1024);
});
