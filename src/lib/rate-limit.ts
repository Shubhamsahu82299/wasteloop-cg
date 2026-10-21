import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function consumeRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const key = createHash("sha256").update(identifier).digest("hex");
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - windowMs);
  const [bucket] = await prisma.$queryRaw<
    { requestCount: number; windowStartedAt: Date }[]
  >`
    INSERT INTO "ApiRateLimitBucket" ("key", "windowStartedAt", "requestCount", "updatedAt")
    VALUES (${key}, ${now}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "requestCount" = CASE
        WHEN "ApiRateLimitBucket"."windowStartedAt" <= ${expiredBefore} THEN 1
        ELSE LEAST("ApiRateLimitBucket"."requestCount" + 1, ${maxRequests + 1})
      END,
      "windowStartedAt" = CASE
        WHEN "ApiRateLimitBucket"."windowStartedAt" <= ${expiredBefore} THEN ${now}
        ELSE "ApiRateLimitBucket"."windowStartedAt"
      END,
      "updatedAt" = ${now}
    RETURNING "requestCount", "windowStartedAt"
  `;

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(
      (bucket.windowStartedAt.getTime() + windowMs - Date.now()) / 1000,
    ),
  );

  return {
    allowed: bucket.requestCount <= maxRequests,
    retryAfterSeconds,
  };
}
