ALTER TABLE "Complaint"
ADD COLUMN "slaEscalatedAt" TIMESTAMP(3);

CREATE INDEX "Complaint_slaDueAt_slaEscalatedAt_idx"
ON "Complaint"("slaDueAt", "slaEscalatedAt");
