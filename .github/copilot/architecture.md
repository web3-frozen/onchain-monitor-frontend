# Onchain Monitor Frontend — Architecture & Adding New Events

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **API**: Fetches from Go backend at `NEXT_PUBLIC_API_URL`

## Key Files
```
src/app/
  page.tsx                          # Main page: stats, alerts, subscriptions
  components/
    LinkTelegram.tsx                 # Telegram link/unlink flow
    EventCard.tsx                    # Available Alerts — subscribe UI
    SubscriptionRow.tsx             # Your Subscriptions — edit/delete UI
```

## Data Flow
1. `page.tsx` fetches `/api/events`, `/api/stats`, `/api/stats/meta`, `/api/subscriptions`
2. Stats displayed per source with metric cards showing "via {data_source}"
3. Events grouped by category in "Available Alerts" section
4. Subscriptions shown in "Your Subscriptions" with inline editing

## Event Types (determined by event.name suffix)
- `_metric_alert` — threshold-based alerts
  - **Chain-specific** (altura, neverland): drop/increase > X% in Y min
  - **General** (category === "general"): higher/lower than absolute value
- `_daily_report` — daily reports at user-chosen hour
- `_defillama_lp_alert` — LP/DEX reward APY alerts with chain filter, reward APY threshold, and TVL threshold

## Subscription Interface
```ts
interface Subscription {
  id: number;
  event_id: number;
  threshold_pct: number;
  window_minutes: number;
  direction: string;       // "drop" | "increase" | "higher" | "lower"
  report_hour: number;     // 0-23
  threshold_value: number; // absolute threshold for value alerts
  coin: string;           // chain filter for LP alerts, action filter for yield alerts
}
```

## Category Colors (in EventCard.tsx & SubscriptionRow.tsx)
```ts
const categoryColors = {
  altura: "bg-emerald-900/40 text-emerald-400",
  neverland: "bg-purple-900/40 text-purple-400",
  general: "bg-blue-900/40 text-blue-400",
};
```

## Chain Filter Order (page.tsx)
```ts
const chainOrder = ["General", "Hyperliquid", "Monad"];
```

## Sorting
- Snapshots: "general" source first
- Categories: "general" category first
- Chain buttons: ordered by `chainOrder` array

---

## Adding a New Source to Frontend

### Step 1: Add category color
In both `EventCard.tsx` and `SubscriptionRow.tsx`, add to `categoryColors`:
```ts
mysource: "bg-orange-900/40 text-orange-400",
```

### Step 2: Add metric labels (page.tsx)
```ts
const labels = {
    my_metric: "My Metric",
};
```

### Step 3: Add metric formatting if needed (page.tsx)
```ts
// In formatMetric:
if (key === "my_metric") return `${value.toFixed(0)} units`;
```

### Step 4: Add chain to ordering (page.tsx)
```ts
const chainOrder = ["General", "Hyperliquid", "Monad", "MyChain"];
```

### Step 5: Value-based vs percentage-based detection
The frontend detects value-based alerts by:
```ts
const isValueAlert = isMetricAlert && event.category === "general";
```
If your new source uses value-based alerts (like Fear & Greed), set its category to "general" in the backend. Otherwise, it automatically gets the percentage-based UI.

For a new value-based category, update the `isValueAlert` check in both `EventCard.tsx` and `SubscriptionRow.tsx`:
```ts
const isValueAlert = isMetricAlert && ["general", "mysource"].includes(event.category);
```
