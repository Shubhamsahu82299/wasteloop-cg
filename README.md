# WasteLoop CG

WasteLoop CG is a civic complaint and municipal field-work application for citizen reports, evidence, team assignment, resolution tracking, and citizen verification.

## Getting Started

Install dependencies and configure `.env.local` as described below, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local setup and database

1. Install Node.js 24 or later and run `npm install`.
2. Copy `.env.example` to `.env.local` and configure Clerk, Neon PostgreSQL, and private S3-compatible storage. `GEMINI_API_KEY` enables authenticated AI triage; complaints can still be submitted when AI is unavailable.
3. Run `npm run db:generate`.
4. Apply committed migrations with `npm run db:deploy`. For future schema changes, create a migration with `npm run db:migrate -- --name descriptive-name`.
5. Start the app with `npm run dev`.

Keep `DATABASE_URL` on Neon's pooled endpoint and `DIRECT_URL` on its direct endpoint. Never commit `.env` or `.env.local`. The schema is in [`prisma/schema.prisma`](./prisma/schema.prisma).

## Private evidence storage

Configure an S3-compatible private bucket (AWS S3, Cloudflare R2, or another compatible provider) using the `S3_*` settings in `.env.example`. Do not make this bucket public. The application uploads files server-side, validates and resizes images, strips image metadata, stores opaque object keys and metadata in PostgreSQL, and streams images through authenticated routes that enforce complaint ownership and team membership. Evidence is limited to 4 MB and JPEG, PNG, or WebP. Use least-privilege bucket credentials and configure provider-side retention, lifecycle, and backup policies.

## Implemented workflows

- Citizens can create reports, view their own complaint history and timeline, submit resolution feedback, and request reinspection.
- The citizen home dashboard shows authenticated aggregate counts of all WasteLoop reports, resolved reports, and most reported categories; it never substitutes sample figures when live stats fail to load.
- Citizen reports cover water, drainage/flooding, roads, lighting, public transport, health, schools/anganwadis, ration/PDS, welfare, animal welfare, parks/pollution, public hazards, and waste issues. The form collects an optional ward/locality and landmark and suggests a likely service; supervisors still confirm the actual department/team assignment.
- Supervisors/admins can review reports, assign configured teams, approve field work, and request reinspection.
- Field workers can view only complaints assigned to their teams, record completion notes and submit private completion-photo evidence. Waste weight is required only for waste-related complaints.
- The server validates role/team access and status transitions; status changes are recorded in the complaint event history.
- Citizen complaint submission and AI triage require a fresh browser GPS fix at the reported site; the server checks the coordinates against a Chhattisgarh state-boundary polygon. This is a location check, not proof of residency or anti-spoofing.
- New complaints receive priority-based SLA deadlines. The authenticated scheduled job escalates overdue, unresolved complaints by one priority level and records the change in the complaint timeline (no external notification is sent).
- AI triage requires an authenticated session and is optional; failures are explicit and do not block report submission.
- Authenticated AI triage, complaint creation, feedback, staff updates, and uploads use database-backed request limits.

API routes include `GET`/`POST /api/complaints`, `GET /api/civic-stats`, `POST /api/complaints/:trackingCode/feedback`, `POST /api/complaints/:trackingCode/evidence`, `GET /api/complaints/:trackingCode/evidence/:evidenceId`, `GET /api/staff/complaints`, `PATCH /api/staff/complaints/:trackingCode`, `GET`/`POST /api/staff/teams`, `GET`/`POST /api/admin/staff`, `POST /api/cron/sla`, `POST /api/ai-triage`, and `GET /api/health`.

## Chhattisgarh demo data and location checks

The server validates both the citizen GPS and complaint-site GPS; this on-site workflow uses the same fresh GPS fix for both. Coordinates outside the state are rejected even if the client bypasses the UI. Browser GPS may be unavailable or spoofed, so this check does not verify citizenship/residency. The simplified state boundary is geoBoundaries ADM1 data from DataMeet / the Election Commission of India (2011 boundary vintage), licensed CC BY 2.5 IN; see the source metadata at [geoBoundaries](https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/). Synthetic examples in `src/app/data.ts` are clearly marked `[DEMO]` and span multiple Chhattisgarh cities.

The citizen home page uses `public/chhattisgarh_banner.jpg` and the locally supplied `public/chhattisgarh-mahtari.jpg`. It also displays tap-to-call emergency, women and child protection, senior citizen, mental health, cybercrime, and civic service numbers; availability can vary by region.

To add synthetic records to a dedicated non-production database, provide its URL separately from the app's normal `DATABASE_URL` and opt in explicitly from PowerShell. The script refuses to run under `NODE_ENV=production`, will not fall back to the regular database URL, marks each record `DEMO`, and is safe to re-run:

```powershell
$env:DEMO_DATABASE_URL = "your dedicated non-production database URL"
$env:ALLOW_DEMO_DATA = "true"
npm run db:seed-demo-cg
Remove-Item Env:ALLOW_DEMO_DATA
Remove-Item Env:DEMO_DATABASE_URL
```

It creates example complaints for Raipur, Bilaspur, Jagdalpur, Korba, and Ambikapur, plus a demo-only reporter/team. It does not create Clerk logins or upload evidence. Do not point this command at production data.

## Scheduled SLA escalation

Set a random `CRON_SECRET` of at least 32 characters in the deployment environment. Configure the hosting platform's scheduler to send `POST https://<your-domain>/api/cron/sla` every 15 minutes with `Authorization: Bearer <CRON_SECRET>`. The job processes up to 100 overdue active cases per request, can safely be retried, raises each eligible case at most one priority level, and appends a status timeline event. The job is disabled until this secret is configured. Configure provider-backed email/SMS separately if notifications are required; this endpoint does not send them.

## Staff provisioning

Staff roles and team memberships are stored in the database and are never accepted from citizen request data. After migrations are deployed, a trusted operator can bootstrap the first `ADMIN` account for an existing Clerk user from PowerShell:

```powershell
$env:BOOTSTRAP_ADMIN_CLERK_USER_ID = "user_..."
npm run db:bootstrap-admin
Remove-Item Env:BOOTSTRAP_ADMIN_CLERK_USER_ID
```

The script refuses to run if any administrator already exists. Never ask staff to send this ID or database credentials over chat. Administrators can then use `/admin` to create departments/teams and provision staff roles and field-team memberships. Changes are recorded in `StaffAdminEvent`; the endpoint prevents demoting the last administrator. Prisma Studio (`npm run db:studio`) is suitable only for controlled development setup; do not expose it publicly or grant staff direct database access. Apply all committed migrations before enabling the administration screen.

## Tests and production launch checklist

Run complaint workflow, SLA policy, and evidence validation tests with `npm test`, static analysis with `npm run lint`, and the production build with `npm run build`.

- Configure production Clerk keys and allowed sign-in domains; verify citizen and staff access with separate accounts.
- Configure Neon pooling, apply deployment migrations (including the rate-limit table), enable point-in-time recovery, and test restores.
- Configure a private evidence bucket, least-privilege credentials, retention/lifecycle policy, and upload/download smoke tests.
- Bootstrap the first administrator through a trusted database operator, then provision supervisors, teams, and field-worker memberships from `/admin`.
- Configure deployment secrets, run `npm run db:deploy`, and run the production build.
- Add operational alerting, log retention, privacy/records review, and provider-backed citizen/staff notifications before a public municipal launch.
- Resolve the high-severity Prisma CLI dependency advisory before production; do not apply the suggested major-version upgrade without Prisma 7 compatibility testing.

The supervisor coordinate plot is illustrative, not a street map or navigation system. Automated notifications, production monitoring, and end-to-end tests still require implementation/configuration; the app is not production-certified until these launch requirements are completed.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
