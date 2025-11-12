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
# hkparking
