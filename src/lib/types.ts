export interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface Subscription {
  id: number;
  event_id: number;
  threshold_pct: number;
  window_minutes: number;
  direction: string;
  report_hour: number;
  threshold_value: number;
  coin: string;
}

export interface Snapshot {
  source: string;
  chain: string;
  metrics: Record<string, number>;
  data_sources: Record<string, string>;
  fetched_at: string;
}

export interface StatsMeta {
  chains: string[];
  poll_interval: string;
}

export interface SubscribeParams {
  tg_chat_id: number;
  event_id: number;
  threshold_pct: number;
  window_minutes: number;
  direction: string;
  report_hour: number;
  threshold_value: number;
  coin: string;
}

export interface UpdateSubscriptionParams {
  threshold_pct: number;
  window_minutes: number;
  direction: string;
  report_hour: number;
  threshold_value: number;
  coin: string;
}
