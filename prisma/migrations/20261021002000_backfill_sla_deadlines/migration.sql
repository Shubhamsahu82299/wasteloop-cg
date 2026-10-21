UPDATE "Complaint"
SET "slaDueAt" = "createdAt" + CASE "priority"
    WHEN 'URGENT'::"CasePriority" THEN INTERVAL '4 hours'
    WHEN 'HIGH'::"CasePriority" THEN INTERVAL '24 hours'
    WHEN 'MEDIUM'::"CasePriority" THEN INTERVAL '72 hours'
    WHEN 'LOW'::"CasePriority" THEN INTERVAL '120 hours'
END
WHERE "slaDueAt" IS NULL;
