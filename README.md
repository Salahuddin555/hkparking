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

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the project and select the `parking-hub` directory.
3. Use the default build command `npm run build` and output directory `.next`.
4. Set the framework preset to **Next.js**.

No environment variables are required for this demo dataset.
# hkparking
