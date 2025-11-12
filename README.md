# HarborPark

A concept web app for discovering vetted private parking spaces across Hong Kong with live availability pulses. Built with Next.js (App Router), Tailwind CSS, and lightweight client-side simulation to mimic real-time supply signals. Ready for Vercel deployment.

## Features

- Live-inspired marketplace overview with hero, metrics, and curated host list
- Interactive filter bar with search, district scope, availability tiers, and EV-only toggle
- Real-time feel via a client hook that simulates live slot counts and utilization stats
- Simple map visualization anchoring hosts across Hong Kong
- Tailwind-driven glassmorphism UI ready for branding tweaks

## Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Quality

```bash
npm run lint
npm run build
```

## Supabase booking storage

1. Create a Supabase project and set the following environment variables (for local dev place them in `.env.local`):

   ```bash
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

   You can copy `.env.local.example` and fill in your project values.

2. Run the SQL migrations in `supabase/sql` inside the Supabase SQL editor or the CLI in order (they’re written to be idempotent):

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/sql/001_create_booking_requests.sql
   psql "$SUPABASE_DB_URL" -f supabase/sql/002_booking_requests_policies.sql
   ```

   The scripts create the `booking_requests` table (with time-window, email, and plate constraints plus status tracking), enable row-level security, and add policies allowing public inserts while restricting reads/updates to the `service_role`.

Once those steps are complete, the booking form will persist submissions into Supabase via the `/api/bookings` route.

### Connectivity check

Use the provided script to verify your environment variables and Supabase policies:

```bash
SUPABASE_URL=... SUPABASE_ANON_KEY=... npm run check:supabase
```

This runs `src/scripts/check-supabase.ts`, which calls the booking API handler directly and records a test row (identified by `space_id = 'health-check'` and clear notes) that you can delete later inside Supabase.
# hkparking

## Deployment & integrations

- **Supabase** – run the SQL migrations above once per project and keep the `booking_requests` policies enabled. Create a service role key if you later need privileged reads or status updates.
- **Environment variables** – copy `.env.local.example` to `.env.local` for local dev. In Vercel, go to *Project → Settings → Environment Variables* and add `SUPABASE_URL` + `SUPABASE_ANON_KEY`; redeploy so the serverless runtime picks them up.
- **Vercel + GitHub** – import the `Salahuddin555/hkparking` repo in Vercel, select the `main` branch, and enable automatic deployments on push. Vercel will install dependencies and run `next build` by default.
- **GitHub Actions** – the workflow in `.github/workflows/ci.yml` runs `npm run lint` and `npm run build` on every push/PR. Add repository secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` if you want the optional Supabase connectivity job to run in CI.
- **Health checks** – run `npm run check:supabase` locally (or let CI run it once the secrets are set) whenever you update RLS policies or rotate keys to ensure Supabase still accepts inserts.
