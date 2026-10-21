import { CasePriority, CaseStatus, PrismaClient, UserRole } from "@prisma/client";

if (process.env.NODE_ENV === "production") {
  console.error("Demo data cannot be seeded when NODE_ENV is production.");
  process.exit(1);
}

if (process.env.ALLOW_DEMO_DATA !== "true") {
  console.error("Set ALLOW_DEMO_DATA=true explicitly to seed demo records.");
  process.exit(1);
}

if (!process.env.DEMO_DATABASE_URL) {
  console.error("Set DEMO_DATABASE_URL to a dedicated non-production database.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DEMO_DATABASE_URL } },
});
const cases = [
  {
    code: "DEMO-CG-RAIPUR-001",
    title: "[DEMO] Missed collection near Shankar Nagar",
    category: "Garbage & Dumping",
    location: "Shankar Nagar, Raipur, Chhattisgarh",
    ward: "Demo Ward 01",
    latitude: 21.2514,
    longitude: 81.6296,
    priority: CasePriority.HIGH,
    status: CaseStatus.IN_PROGRESS,
    path: [
      CaseStatus.SUBMITTED,
      CaseStatus.UNDER_REVIEW,
      CaseStatus.ASSIGNED,
      CaseStatus.IN_PROGRESS,
    ],
  },
  {
    code: "DEMO-CG-BILASPUR-001",
    title: "[DEMO] Drain blockage near Gol Bazar",
    category: "Drainage Issue",
    location: "Gol Bazar area, Bilaspur, Chhattisgarh",
    ward: "Demo Ward 02",
    latitude: 22.0797,
    longitude: 82.1409,
    priority: CasePriority.MEDIUM,
    status: CaseStatus.UNDER_REVIEW,
    path: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW],
  },
  {
    code: "DEMO-CG-JAGDALPUR-001",
    title: "[DEMO] Community bin overflow in Jagdalpur",
    category: "Garbage & Dumping",
    location: "Dharampura, Jagdalpur, Chhattisgarh",
    ward: "Demo Ward 03",
    latitude: 19.0748,
    longitude: 82.008,
    priority: CasePriority.URGENT,
    status: CaseStatus.ASSIGNED,
    path: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW, CaseStatus.ASSIGNED],
  },
  {
    code: "DEMO-CG-KORBA-001",
    title: "[DEMO] Construction debris near Transport Nagar",
    category: "Construction Waste",
    location: "Transport Nagar, Korba, Chhattisgarh",
    ward: "Demo Ward 04",
    latitude: 22.3595,
    longitude: 82.7501,
    priority: CasePriority.LOW,
    status: CaseStatus.SUBMITTED,
    path: [CaseStatus.SUBMITTED],
  },
  {
    code: "DEMO-CG-AMBIKAPUR-001",
    title: "[DEMO] Fallen branch on a pedestrian path",
    category: "Trees & Green Spaces",
    location: "Ring Road area, Ambikapur, Chhattisgarh",
    ward: "Demo Ward 05",
    latitude: 23.1167,
    longitude: 83.2,
    priority: CasePriority.MEDIUM,
    status: CaseStatus.AWAITING_VERIFICATION,
    path: [
      CaseStatus.SUBMITTED,
      CaseStatus.UNDER_REVIEW,
      CaseStatus.ASSIGNED,
      CaseStatus.IN_PROGRESS,
      CaseStatus.AWAITING_VERIFICATION,
    ],
  },
];

try {
  const reporter = await prisma.user.upsert({
    where: { clerkUserId: "demo-cg-reporter-not-for-login" },
    create: {
      clerkUserId: "demo-cg-reporter-not-for-login",
      name: "DEMO DATA - Not a real citizen",
      role: UserRole.CITIZEN,
    },
    update: {},
    select: { id: true },
  });

  const department = await prisma.department.upsert({
    where: { name: "DEMO DATA - Chhattisgarh Municipal Operations" },
    create: { name: "DEMO DATA - Chhattisgarh Municipal Operations" },
    update: {},
    select: { id: true },
  });

  const team = await prisma.team.upsert({
    where: {
      departmentId_name: {
        departmentId: department.id,
        name: "DEMO DATA - Statewide Test Team",
      },
    },
    create: {
      departmentId: department.id,
      name: "DEMO DATA - Statewide Test Team",
    },
    update: {},
    select: { id: true },
  });

  let inserted = 0;
  for (const [index, sample] of cases.entries()) {
    const existing = await prisma.complaint.findUnique({
      where: { trackingCode: sample.code },
      select: { id: true },
    });
    if (existing) continue;

    const createdAt = new Date(Date.now() - (index + 1) * 60 * 60 * 1000);
    const resolved = sample.status === CaseStatus.RESOLVED;
    await prisma.complaint.create({
      data: {
        trackingCode: sample.code,
        title: sample.title,
        category: sample.category,
        description: `DEMO ONLY — synthetic test record for ${sample.location}. Not a real public report.`,
        location: sample.location,
        ward: sample.ward,
        latitude: sample.latitude,
        longitude: sample.longitude,
        priority: sample.priority,
        status: sample.status,
        reporterId: reporter.id,
        assignedDepartmentId: sample.path.includes(CaseStatus.ASSIGNED) ? department.id : null,
        assignedTeamId: sample.path.includes(CaseStatus.ASSIGNED) ? team.id : null,
        slaDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        resolvedAt: resolved ? new Date() : null,
        createdAt,
        events: {
          create: sample.path.map((status, eventIndex) => ({
            status,
            note: `DEMO ONLY — ${status.toLowerCase().replaceAll("_", " ")} sample event.`,
            createdAt: new Date(createdAt.getTime() + eventIndex * 5 * 60 * 1000),
          })),
        },
      },
    });
    inserted++;
  }

  console.log(`Inserted ${inserted} Chhattisgarh demo complaints; existing demo records were left unchanged.`);
} catch (error) {
  console.error("Failed to seed Chhattisgarh demo records:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
