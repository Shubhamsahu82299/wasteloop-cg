CREATE TABLE "StaffAdminEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffAdminEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StaffAdminEvent_actorId_createdAt_idx" ON "StaffAdminEvent"("actorId", "createdAt");
CREATE INDEX "StaffAdminEvent_targetId_createdAt_idx" ON "StaffAdminEvent"("targetId", "createdAt");

ALTER TABLE "StaffAdminEvent"
ADD CONSTRAINT "StaffAdminEvent_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StaffAdminEvent"
ADD CONSTRAINT "StaffAdminEvent_targetId_fkey"
FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
