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

## Booking API

The booking form posts JSON to the endpoint defined by `NEXT_PUBLIC_BOOKINGS_ENDPOINT` (defaults to `/api/bookings`). In production this path is backed by the FastAPI serverless function at `api/bookings.py`, which runs on Vercel’s Python runtime and talks directly to Supabase.

### Local FastAPI server

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.bookings:app --reload --port 8000
```

With the server running, set `NEXT_PUBLIC_BOOKINGS_ENDPOINT=http://localhost:8000` in `.env.local` so that `npm run dev` posts to your local FastAPI instance.

## Supabase booking storage

1. Create a Supabase project and set the following environment variables (for local dev place them in `.env.local`):

   ```bash
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

   You can copy `.env.local.example` and fill in your project values.
   The same variables must be available to the FastAPI runtime (locally via your shell or in Vercel environment settings).

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
NEXT_PUBLIC_BOOKINGS_ENDPOINT=... npm run check:supabase
```

This runs `src/scripts/check-supabase.ts`, which sends a test payload to the configured booking endpoint (the FastAPI service) and records a row identified by `space_id = 'health-check'`. You can delete it later inside Supabase.
# hkparking

## Deployment & integrations

- **Supabase** – run the SQL migrations above once per project and keep the `booking_requests` policies enabled. Create a service role key if you later need privileged reads or status updates.
- **Environment variables** – copy `.env.local.example` to `.env.local` for local dev. In Vercel, go to *Project → Settings → Environment Variables* and add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and (optionally) override `NEXT_PUBLIC_BOOKINGS_ENDPOINT` if you deploy the FastAPI service elsewhere.
- **Vercel + GitHub** – import the `Salahuddin555/hkparking` repo in Vercel, select the `main` branch, and enable automatic deployments on push. Vercel will install dependencies, run `next build`, and automatically provision the Python serverless function at `api/bookings.py` using `requirements.txt`.
- **GitHub Actions** – the workflow in `.github/workflows/ci.yml` runs `npm run lint` and `npm run build` on every push/PR. Add repository secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` if you want the optional Supabase connectivity job to run in CI.
- **Health checks** – run `npm run check:supabase` locally (or let CI run it once the secrets are set) whenever you update RLS policies or rotate keys to ensure Supabase still accepts inserts.
