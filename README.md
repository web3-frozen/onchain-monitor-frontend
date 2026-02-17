# Onchain Monitor — Frontend

A Next.js dashboard for subscribing to on-chain monitoring alerts via Telegram. Users can browse available events, link their Telegram account, and manage subscriptions.

## Features

- **Multi-source dashboard** — displays live metrics from all registered data sources (Altura, Neverland, etc.)
- **Event subscriptions** — subscribe to drop alerts and daily reports per source
- **Telegram linking** — link your Telegram account with a 6-character OTP via `@crypto_stat_monitoring_bot`
- **Responsive UI** — dark theme, Tailwind CSS

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, React 19)
- [Tailwind CSS 3](https://tailwindcss.com/)
- TypeScript

## Project Structure

```
src/app/
  page.tsx                  # Main dashboard page
  layout.tsx                # Root layout
  globals.css               # Global styles + Tailwind imports
  components/
    EventCard.tsx            # Event subscription card
    LinkTelegram.tsx         # Telegram OTP linking form
```

## API Integration

The frontend talks to the backend API at the same domain under `/api/`:

| Endpoint | Usage |
|----------|-------|
| `GET /api/events` | Fetch available monitoring events |
| `GET /api/stats` | Fetch latest metric snapshots for all sources |
| `POST /api/link` | Link Telegram account via OTP code |
| `GET /api/subscriptions` | List current subscriptions |
| `POST /api/subscriptions` | Subscribe to an event |
| `DELETE /api/subscriptions/{id}` | Unsubscribe |

## Local Development

```bash
# Prerequisites: Node.js 22+

npm install
npm run dev
```

The dev server starts at `http://localhost:3000`. By default, API calls go to relative `/api/*` paths — either run the backend on the same host with a proxy, or set the API URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

> **Note:** `NEXT_PUBLIC_*` variables are inlined at build time. For production Docker images, leave it empty so the frontend uses relative paths (same-domain routing via Traefik ingress).

## Docker

```bash
docker build -t onchain-monitor-frontend .
docker run -p 3000:3000 onchain-monitor-frontend
```

The Dockerfile uses a multi-stage build (deps → build → standalone runner) for a minimal production image.

## Deployment

Deployed to Kubernetes via ArgoCD GitOps:

1. Push to `main` triggers CI (lint, build, Docker push to GHCR)
2. Image tag is updated in `homelab-apps` kustomization
3. ArgoCD syncs — Traefik routes `/` to the frontend and `/api` to the backend

Live at: **https://monitoring.dummysui.monster**

## License

Private repository — all rights reserved.
