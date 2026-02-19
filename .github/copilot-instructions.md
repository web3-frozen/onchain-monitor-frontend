# Onchain Monitor Frontend — AI Agent Instructions

This file provides context for AI coding agents (GitHub Copilot, etc.) working on this codebase.

## Project Overview

**Onchain Monitor Frontend** is a Next.js (App Router) dashboard for monitoring on-chain DeFi metrics. It displays live stats, provides Telegram alert subscriptions, and supports Vercel preview deployments with mock data.

## Architecture

```
src/
  app/
    page.tsx                → Main dashboard (stats, events, subscriptions)
    layout.tsx              → Root layout
    globals.css             → Tailwind global styles
    components/
      EventCard.tsx         → Individual alert event card with interactive controls
      LinkTelegram.tsx      → Telegram OTP linking UI
      SubscriptionRow.tsx   → Active subscription display + edit/delete
    api/                    → Next.js API routes (mock data for Vercel previews)
      events/route.ts
      stats/route.ts
      stats/meta/route.ts
      subscriptions/route.ts
      notifications/route.ts
  lib/
    api.ts                  → API client (calls NEXT_PUBLIC_API_URL or same-origin)
    types.ts                → TypeScript interfaces (Event, Subscription, Snapshot, StatsMeta)
    mock-data.ts            → Realistic mock data for preview deployments
```

## Key Design Patterns

### Event Card Source Labels (IMPORTANT)

Every event card **must** display two badges:
1. **Chain badge** — the blockchain/network (General, Hyperliquid, Monad)
2. **Source label** — the specific project/data source (Altura, Neverland, Merkl, Turtle, Binance, Fear & Greed, MaxPain)

The API returns `event.category` as project name (`altura`, `neverland`, `general`).
The frontend maps this to chain names for display.

**When adding a new event/source:**
1. Add the event name → source label mapping in `EventCard.tsx` `sourceLabels` record
2. If the event is in a new category, add the category → chain mapping in both:
   - `EventCard.tsx` `categoryToChain`
   - `page.tsx` `categoryToChain`
3. Add event-specific interactive controls in `EventCard.tsx` (see existing patterns for metric alerts, daily reports, yield alerts, binance price, maxpain)

Current mapping:
| API Category | Display Chain | Projects (source labels) |
|---|---|---|
| `general` | General | Fear & Greed, MaxPain, Merkl, Turtle, Binance |
| `altura` | Hyperliquid | Altura |
| `neverland` | Monad | Neverland |

### Mock API for Previews

When `NEXT_PUBLIC_API_URL` is empty (Vercel previews), the frontend calls same-origin `/api/*` routes that return realistic mock data. This allows PR reviewers to see the full UI without connecting to a real backend.

When `NEXT_PUBLIC_API_URL` is set (production K8s), the frontend calls the real backend and the mock routes are unused.

### Yield Alert UI Pattern

Merkl and Turtle share the same `isYieldAlert` UI pattern since they use identical backend parameters:
- `thresholdValue` → min APR %
- `thresholdPct` → min TVL in millions
- `coin` → action filter (ALL, LEND, BORROW, HOLD)
- `direction` → stablecoin filter (stablecoin, non-stablecoin, any)

When adding a new yield aggregator source, reuse `isYieldAlert` if it follows this pattern.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Deploy**: Kubernetes (ArgoCD) for production, Vercel for PR previews
- **CI**: GitHub Actions (lint, build, integration test, security scan)

## Common Commands

```bash
npm run dev     # Development server
npm run build   # Production build
npm run lint    # ESLint
npm run test    # Tests (placeholder)
```

## Important Design Decisions

1. **Chain-based grouping**: Stats and alerts are grouped by chain (General, Hyperliquid, Monad), not by project
2. **Source labels on every card**: Users must always be able to identify which data source an alert comes from
3. **Preview isolation**: Vercel previews use mock data only — no connection to production backend (security)
4. **Category → Chain mapping**: API categories are project names; frontend maps them to chain names for user-facing display
