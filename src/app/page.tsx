"use client";

import { useEffect, useState, useCallback } from "react";
import { LinkTelegram } from "./components/LinkTelegram";
import { EventCard } from "./components/EventCard";
import { SubscriptionRow } from "./components/SubscriptionRow";
import { api } from "../lib/api";
import type { Event, Subscription, Snapshot, StatsMeta } from "../lib/types";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [meta, setMeta] = useState<StatsMeta | null>(null);
  const [selectedChain, setSelectedChain] = useState("All");
  const [tgChatId, setTgChatId] = useState<number | null>(null);
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tg_chat_id");
    if (saved) {
      setTgChatId(Number(saved));
      setLinked(true);
    }
  }, []);

  useEffect(() => {
    api.listEvents().then(setEvents).catch(console.error);
    api.listSnapshots().then(setSnapshots).catch(console.error);
    api.getStatsMeta().then(setMeta).catch(console.error);
  }, []);

  const loadSubs = useCallback(() => {
    if (!tgChatId) return;
    api.listSubscriptions(tgChatId).then(setSubs).catch(console.error);
  }, [tgChatId]);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  const handleLinked = (chatId: number) => {
    setTgChatId(chatId);
    setLinked(true);
    localStorage.setItem("tg_chat_id", String(chatId));
  };

  const handleUnlink = async () => {
    if (!tgChatId) return;
    await api.unlinkTelegram(tgChatId);
    setTgChatId(null);
    setLinked(false);
    setSubs([]);
    localStorage.removeItem("tg_chat_id");
  };

  const handleSubscribe = async (
    eventId: number,
    thresholdPct?: number,
    windowMinutes?: number,
    direction?: string,
    reportHour?: number,
    thresholdValue?: number,
    coin?: string
  ) => {
    if (!tgChatId) return;
    try {
      await api.subscribe({
        tg_chat_id: tgChatId,
        event_id: eventId,
        threshold_pct: thresholdPct ?? 10,
        window_minutes: windowMinutes ?? 1,
        direction: direction ?? "drop",
        report_hour: reportHour ?? 8,
        threshold_value: thresholdValue ?? 0,
        coin: coin ?? "",
      });
    } catch (e) {
      console.error("Subscribe error:", e);
      alert(`Subscribe failed: ${e}`);
      return;
    }
    loadSubs();
  };

  const handleUpdateSub = async (
    subId: number,
    thresholdPct: number,
    windowMinutes: number,
    direction: string,
    reportHour: number,
    thresholdValue: number,
    coin: string
  ) => {
    await api.updateSubscription(subId, {
      threshold_pct: thresholdPct,
      window_minutes: windowMinutes,
      direction,
      report_hour: reportHour,
      threshold_value: thresholdValue,
      coin,
    });
    loadSubs();
  };

  const handleDeleteSub = async (subId: number) => {
    await api.deleteSubscription(subId);
    loadSubs();
  };

  const eventsMap = new Map(events.map((e) => [e.id, e]));

  const chainOrder = ["General", "Hyperliquid", "Monad"];
  const chains = (meta?.chains ?? []).sort(
    (a, b) => (chainOrder.indexOf(a) === -1 ? 99 : chainOrder.indexOf(a)) - (chainOrder.indexOf(b) === -1 ? 99 : chainOrder.indexOf(b))
  );
  const pollLabel = meta?.poll_interval
    ? meta.poll_interval.replace("s", "s").replace("60s", "1 min")
    : "1 min";

  const categoryOrder = ["general", "hyperliquid", "monad", "neverland", "altura"];
  const catIdx = (c: string) => { const i = categoryOrder.indexOf(c); return i === -1 ? 99 : i; };

  const filteredSnapshots = (
    selectedChain === "All"
      ? snapshots
      : snapshots.filter((s) => s.chain === selectedChain)
  ).sort((a, b) => catIdx(a.source) - catIdx(b.source));

  const visibleSources = new Set(filteredSnapshots.map((s) => s.source));

  const formatNumber = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}K`;
    return `$${v.toFixed(4)}`;
  };

  const metricLabel = (key: string, source?: string) => {
    if (key === "price") {
      const tokenNames: Record<string, string> = {
        neverland: "DUST",
        altura: "AVLT",
      };
      const token = source ? tokenNames[source] : undefined;
      return token ? `${token} Price` : "Price";
    }
    const labels: Record<string, string> = {
      tvl: "TVL",
      apr: "APR",
      vedust_tvl: "veDUST TVL",
      fees_24h: "Fees (24h)",
      fees_7d: "Fees (7d)",
      fees_30d: "Fees (30d)",
      fear_greed_index: "Fear & Greed",
      opportunities: "Opportunities",
      top_apr: "Top APR",
      top_yield: "Top Yield",
      BTC_price: "BTC Price",
      BTC_long_maxpain: "BTC Long Max Pain (24h)",
      BTC_short_maxpain: "BTC Short Max Pain (24h)",
      ETH_price: "ETH Price",
      ETH_long_maxpain: "ETH Long Max Pain (24h)",
      ETH_short_maxpain: "ETH Short Max Pain (24h)",
    };
    return labels[key] || key;
  };

  const formatMetric = (key: string, value: number) => {
    if (key === "apr" || key === "top_apr" || key === "top_yield") return `${value.toFixed(2)}%`;
    if (key === "fear_greed_index") return `${value.toFixed(0)} / 100`;
    if (key === "opportunities") return `${value.toFixed(0)}`;
    if (key.includes("maxpain") && value === 0) return "N/A";
    return formatNumber(value);
  };

  const timeAgo = (iso: string) => {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  const filteredEvents = events.filter(
    (e) => selectedChain === "All" || visibleSources.has(e.category)
  );
  const categories = [...new Set(filteredEvents.map((e) => e.category))].sort(
    (a, b) => catIdx(a) - catIdx(b)
  );

  // Filter subscriptions by visible sources
  const filteredSubs = subs.filter((s) => {
    const ev = eventsMap.get(s.event_id);
    return ev && (selectedChain === "All" || visibleSources.has(ev.category));
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-brand mb-2">Onchain Monitor</h1>
      <p className="text-white/50 mb-6">
        Monitor on-chain stats and subscribe to Telegram alerts via{" "}
        <a
          href="https://t.me/crypto_stat_monitoring_bot"
          className="text-brand hover:underline"
          target="_blank"
        >
          @crypto_stat_monitoring_bot
        </a>
      </p>

      {/* Chain Filter */}
      <div className="flex gap-2 mb-6">
        {["All", ...chains].map((chain) => (
          <button
            key={chain}
            onClick={() => setSelectedChain(chain)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedChain === chain
                ? "bg-brand text-black"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {chain}
          </button>
        ))}
      </div>

      {/* Live Stats — group snapshots by chain */}
      {(() => {
        // Group snapshots by chain
        const chainGroups = new Map<string, Snapshot[]>();
        for (const snap of filteredSnapshots) {
          const g = chainGroups.get(snap.chain) || [];
          g.push(snap);
          chainGroups.set(snap.chain, g);
        }
        // Sort chains: General first
        const sortedChains = [...chainGroups.keys()].sort((a, b) => {
          const order = ["General", "Hyperliquid", "Monad"];
          const ai = order.indexOf(a) === -1 ? 99 : order.indexOf(a);
          const bi = order.indexOf(b) === -1 ? 99 : order.indexOf(b);
          return ai - bi;
        });
        return sortedChains.map((chain) => {
          const snaps = chainGroups.get(chain)!;
          const latest = snaps.reduce((a, b) =>
            new Date(a.fetched_at) > new Date(b.fetched_at) ? a : b
          );
          // Merge all metrics and data_sources from all snapshots in this chain
          const allMetrics: Record<string, number> = {};
          const allDataSources: Record<string, string> = {};
          const allSourceLabels: Record<string, string> = {};
          for (const snap of snaps) {
            for (const [k, v] of Object.entries(snap.metrics)) {
              allMetrics[k] = v;
              allSourceLabels[k] = snap.source;
            }
            if (snap.data_sources) {
              for (const [k, v] of Object.entries(snap.data_sources)) {
                allDataSources[k] = v;
              }
            }
          }
          // Group metrics by source for rendering sections
          const sourceOrder = ["general", "maxpain", "merkl", "turtle", "altura", "neverland"];
          const metricsBySource = new Map<string, [string, number][]>();
          for (const [k, v] of Object.entries(allMetrics)) {
            const src = allSourceLabels[k] || "unknown";
            const arr = metricsBySource.get(src) || [];
            arr.push([k, v]);
            metricsBySource.set(src, arr);
          }
          const sortedSources = [...metricsBySource.keys()].sort(
            (a, b) => (sourceOrder.indexOf(a) === -1 ? 99 : sourceOrder.indexOf(a)) - (sourceOrder.indexOf(b) === -1 ? 99 : sourceOrder.indexOf(b))
          );

          return (
            <div key={chain} className="mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-lg font-semibold">
                  {chain}
                </h2>
                <span className="text-xs text-white/30">
                  updated {timeAgo(latest.fetched_at)} · refreshes every {pollLabel}
                </span>
              </div>
              <div className="p-4 border border-white/10 rounded-lg bg-white/5 space-y-4">
                {sortedSources.map((src) => {
                  const metrics = metricsBySource.get(src)!;
                  const sourceSnap = snaps.find((s) => s.source === src);
                  return (
                    <div key={src}>
                      <div className="text-xs font-medium text-white/30 uppercase mb-2 border-b border-white/5 pb-1">
                        {src === "general" ? "Fear & Greed" : src}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {metrics.map(([key, value]) => (
                          <div key={key}>
                            <div className="text-white/50 text-xs uppercase mb-1">
                              {metricLabel(key, src)}
                            </div>
                            <div className="text-lg font-semibold">
                              {formatMetric(key, value)}
                            </div>
                            {allDataSources[key] && (
                              <div className="text-[10px] text-white/25 mt-0.5">
                                via {allDataSources[key]}
                              </div>
                            )}
                            {key === "opportunities" && allDataSources[key] && (
                              <div className="text-[10px] text-white/25 mt-0.5">
                                {allDataSources[key] === "Merkl"
                                  ? "APR ≥ 5% · TVL ≥ $500K · All tokens · LIVE"
                                  : "Yield ≥ 5% · TVL ≥ $500K · Active"}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        });
      })()}

      {/* Link Telegram */}
      {!linked && <LinkTelegram onLinked={handleLinked} />}

      {linked && (
        <div className="mb-6 p-3 border border-brand/30 rounded-lg bg-brand/5 text-sm text-brand flex items-center justify-between">
          <span>✅ Telegram linked (Chat ID: {tgChatId})</span>
          <button
            onClick={handleUnlink}
            className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-white/50 border border-white/10 hover:bg-red-900/30 hover:text-red-400 hover:border-red-400/40 transition-all"
          >
            Unlink
          </button>
        </div>
      )}

      {/* Available Alerts */}
      <h2 className="text-xl font-semibold mb-4">Available Alerts</h2>
      {categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h3 className="text-sm font-medium text-white/40 uppercase mb-2">
            {cat}
          </h3>
          <div className="space-y-3">
            {filteredEvents
              .filter((e) => e.category === cat)
              .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    canToggle={linked}
                    onSubscribe={handleSubscribe}
                  />
                ))}
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <p className="text-white/30 text-center py-8">Loading events...</p>
      )}

      {/* Your Subscriptions */}
      {linked && filteredSubs.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 mt-10">
            Your Subscriptions
          </h2>
          <div className="space-y-3">
            {filteredSubs.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
                event={eventsMap.get(sub.event_id)}
                onUpdate={handleUpdateSub}
                onDelete={handleDeleteSub}
              />
            ))}
          </div>
        </>
      )}
      {/* Contribute & Donate */}
      <footer className="mt-16 border-t border-white/10 pt-8 pb-4 text-center text-sm text-white/40 space-y-4">
        <p>
          Built by{" "}
          <a
            href="https://x.com/dummysui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            @dummysui
          </a>
        </p>
        <p>
          Want to contribute? Open an issue or pull request on{" "}
          <a
            href="https://github.com/web3-frozen/onchain-monitor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            GitHub
          </a>
        </p>
        <div className="space-y-1">
          <p className="text-white/50 font-medium">Donate</p>
          <p>
            EVM:{" "}
            <code className="text-white/60 text-xs break-all">
              0x7e1e8f5ee9edadbe4fa174ec7c15c8e5725de2c0
            </code>
          </p>
          <p>
            SOL:{" "}
            <code className="text-white/60 text-xs break-all">
              JAKQD8BMjY5HTM2bXihdP514o5uh8fCywTqCadAWctJz
            </code>
          </p>
          <p>
            SUI:{" "}
            <code className="text-white/60 text-xs break-all">
              0x81346cae241988135f6c978a1a804a131861c7e51529e7b1a697752d79035e95
            </code>
          </p>
        </div>
      </footer>
    </main>
  );
}
