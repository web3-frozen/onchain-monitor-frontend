# Onchain Monitor — Frontend

A Next.js dashboard for monitoring on-chain DeFi metrics and managing Telegram alert subscriptions. Displays live data from multiple sources grouped by chain, with configurable alerting.

## Features

- **Multi-source dashboard** — live metrics from Altura, Neverland, Fear & Greed, Max Pain, and Merkl
- **Chain-based grouping** — snapshots grouped by chain (General, HyperEVM, etc.) with source subtitles
- **Configurable alerts** — subscribe with custom thresholds, directions (increase/drop), and time windows
- **Merkl yield discovery** — filter by APR, TVL, action (LEND/HOLD/BORROW), stablecoin preference
- **Binance price alerts** — subscribe to price increase/decrease targets for any coin (default BTC/USDT)
- **Telegram linking** — link your Telegram account with a 6-character OTP via `@crypto_stat_monitoring_bot`
- **Responsive UI** — dark theme, Tailwind CSS

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, React 19)
- [Tailwind CSS 3](https://tailwindcss.com/)
- TypeScript

## Dashboard Layout

Metrics are grouped by chain:
- **General** — Fear & Greed Index, BTC/ETH Max Pain (24h), Merkl opportunities
- **HyperEVM** — Altura (TVL, AVLT Price, APR), Neverland (TVL, DUST Price, Fees)

Each source shows a subtitle for attribution. Max Pain values display "N/A" when data is insufficient. Interval labels (e.g., "(24h)") indicate the calculation window.

## Subscription Types

| Alert Type | User Configures |
|------------|-----------------|
| **Value alert** | Metric, threshold value, direction (above/below) |
| **Metric alert** | Metric, % change, direction (increase/drop), time window (minutes) |
| **Max Pain alert** | Coin (BTC/ETH), position (LONG/SHORT), % proximity |
| **Merkl alert** | Min APR, min TVL, action (LEND/HOLD/BORROW/LEND,HOLD), stablecoin filter |
| **Binance price alert** | Coin symbol (BTC/ETH/...), direction (increase/decrease), target price |
| **Daily report** | Report time (UTC+8) |

## Project Structure

```
src/
  app/
    page.tsx                  # Main dashboard — chain-based snapshot grouping
    layout.tsx                # Root layout
    globals.css               # Global styles + Tailwind imports
    components/
      EventCard.tsx            # Event subscription card with configurable inputs
      LinkTelegram.tsx         # Telegram OTP linking form
      SubscriptionRow.tsx      # Active subscription display with edit/delete
  lib/
    api.ts                    # Typed API client (centralized fetch logic)
    types.ts                  # Shared TypeScript interfaces
```

## API Integration

All API calls go through a centralized typed client (`src/lib/api.ts`) that handles error responses and JSON parsing. Components import the `api` object and shared types from `src/lib/types.ts`.

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

This project is licensed under the [MIT License](LICENSE).
