/**
 * Mock data for preview deployments.
 * When NEXT_PUBLIC_API_URL is empty, the frontend calls same-origin /api/*
 * which returns this realistic dummy data so reviewers can see the full UI.
 */

import type { Event, Snapshot, StatsMeta } from "./types";

export const mockEvents: Event[] = [
  { id: 1, name: "altura_metric_alert", description: "Alert when Altura metrics change significantly", category: "altura" },
  { id: 2, name: "altura_daily_report", description: "Daily UTC+8 report — Altura TVL, AVLT price, APR", category: "altura" },
  { id: 11, name: "neverland_metric_alert", description: "Alert when Neverland metrics change significantly", category: "neverland" },
  { id: 12, name: "neverland_daily_report", description: "Daily UTC+8 report — Neverland TVL, veDUST, DUST price, fees", category: "neverland" },
  { id: 37, name: "general_metric_alert", description: "Alert when Fear & Greed Index changes significantly", category: "general" },
  { id: 38, name: "general_daily_report", description: "Daily UTC+8 report — Crypto Fear & Greed Index", category: "general" },
  { id: 57, name: "general_maxpain_alert", description: "Alert when price hits liquidation max pain", category: "general" },
  { id: 58, name: "general_merkl_alert", description: "Alert on new Merkl yield opportunities", category: "general" },
  { id: 611, name: "general_binance_price_alert", description: "Alert when Binance price reaches target", category: "general" },
  { id: 756, name: "general_turtle_alert", description: "Alert on new Turtle yield opportunities", category: "general" },
  { id: 900, name: "general_alpha_alert", description: "Alert on Binance Alpha airdrops", category: "general" },
  { id: 901, name: "general_defillama_alert", description: "Alert on USDC/USDT yield opportunities from DeFi Llama", category: "general" },
];

export const mockStats: Snapshot[] = [
  {
    source: "altura",
    chain: "Hyperliquid",
    metrics: { tvl: 4242140.56, price: 1.0334, apr: 23.2 },
    data_sources: { tvl: "Ormi Labs Subgraph", price: "Ormi Labs Subgraph", apr: "Ormi Labs Subgraph" },
    fetched_at: new Date().toISOString(),
  },
  {
    source: "neverland",
    chain: "Monad",
    metrics: { tvl: 21016543.45, vedust_tvl: 765007.67, price: 0.4777, fees_24h: 18729, fees_7d: 127671, fees_30d: 578706 },
    data_sources: { tvl: "DefiLlama", vedust_tvl: "DefiLlama", price: "Uniswap (Monad)", fees_24h: "DefiLlama", fees_7d: "DefiLlama", fees_30d: "DefiLlama" },
    fetched_at: new Date().toISOString(),
  },
  {
    source: "general",
    chain: "General",
    metrics: { fear_greed_index: 45 },
    data_sources: { fear_greed_index: "Alternative.me" },
    fetched_at: new Date().toISOString(),
  },
  {
    source: "maxpain",
    chain: "General",
    metrics: { BTC_price: 96500, BTC_long_maxpain: 95000, BTC_short_maxpain: 97000, ETH_price: 2650, ETH_long_maxpain: 2600, ETH_short_maxpain: 2700 },
    data_sources: { BTC_price: "Binance Futures", BTC_long_maxpain: "Binance Futures", BTC_short_maxpain: "Binance Futures", ETH_price: "Binance Futures", ETH_long_maxpain: "Binance Futures", ETH_short_maxpain: "Binance Futures" },
    fetched_at: new Date().toISOString(),
  },
  {
    source: "merkl",
    chain: "General",
    metrics: { opportunities: 24, top_apr: 72.5 },
    data_sources: { opportunities: "Merkl", top_apr: "Merkl" },
    fetched_at: new Date().toISOString(),
  },
  {
    source: "turtle",
    chain: "General",
    metrics: { turtle_opportunities: 88, turtle_top_yield: 91.2 },
    data_sources: { turtle_opportunities: "Turtle", turtle_top_yield: "Turtle" },
    fetched_at: new Date().toISOString(),
  },
  {
    source: "binance",
    chain: "General",
    metrics: { btc_price: 96500 },
    data_sources: { btc_price: "Binance" },
    fetched_at: new Date().toISOString(),
  },
  {
    source: "defillama",
    chain: "General",
    metrics: { usdc_max_apy: 12.5, usdt_max_apy: 11.8, usdc_pools: 42, usdt_pools: 38, total_pools: 156 },
    data_sources: { usdc_max_apy: "DeFi Llama", usdt_max_apy: "DeFi Llama", usdc_pools: "DeFi Llama", usdt_pools: "DeFi Llama", total_pools: "DeFi Llama" },
    fetched_at: new Date().toISOString(),
  },
];

export const mockStatsMeta: StatsMeta = {
  chains: ["General", "Hyperliquid", "Monad"],
  poll_interval: "60s",
};
