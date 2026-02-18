"use client";

import { useEffect, useState, useCallback } from "react";
import { LinkTelegram } from "./components/LinkTelegram";
import { EventCard } from "./components/EventCard";
import { SubscriptionRow } from "./components/SubscriptionRow";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Subscription {
  id: number;
  event_id: number;
  threshold_pct: number;
  window_minutes: number;
  direction: string;
  report_hour: number;
}

interface Snapshot {
  source: string;
  chain: string;
  metrics: Record<string, number>;
  data_sources: Record<string, string>;
  fetched_at: string;
}

interface StatsMeta {
  chains: string[];
  poll_interval: string;
}

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
    fetch(`${API}/api/events`)
      .then((r) => r.json())
      .then(setEvents)
      .catch(console.error);

    fetch(`${API}/api/stats`)
      .then((r) => r.json())
      .then((data) => setSnapshots(Array.isArray(data) ? data : [data]))
      .catch(console.error);

    fetch(`${API}/api/stats/meta`)
      .then((r) => r.json())
      .then(setMeta)
      .catch(console.error);
  }, []);

  const loadSubs = useCallback(() => {
    if (!tgChatId) return;
    fetch(`${API}/api/subscriptions?tg_chat_id=${tgChatId}`)
      .then((r) => r.json())
      .then(setSubs)
      .catch(console.error);
  }, [tgChatId]);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  const handleLinked = (chatId: number) => {
    setTgChatId(chatId);
    setLinked(true);
    localStorage.setItem("tg_chat_id", String(chatId));
  };

  const handleSubscribe = async (
    eventId: number,
    thresholdPct?: number,
    windowMinutes?: number,
    direction?: string,
    reportHour?: number
  ) => {
    if (!tgChatId) return;
    await fetch(`${API}/api/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tg_chat_id: tgChatId,
        event_id: eventId,
        threshold_pct: thresholdPct ?? 10,
        window_minutes: windowMinutes ?? 1,
        direction: direction ?? "drop",
        report_hour: reportHour ?? 8,
      }),
    });
    loadSubs();
  };

  const handleUpdateSub = async (
    subId: number,
    thresholdPct: number,
    windowMinutes: number,
    direction: string,
    reportHour: number
  ) => {
    await fetch(`${API}/api/subscriptions/${subId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threshold_pct: thresholdPct,
        window_minutes: windowMinutes,
        direction,
        report_hour: reportHour,
      }),
    });
    loadSubs();
  };

  const handleDeleteSub = async (subId: number) => {
    await fetch(`${API}/api/subscriptions/${subId}`, { method: "DELETE" });
    loadSubs();
  };

  const eventsMap = new Map(events.map((e) => [e.id, e]));

  const chains = meta?.chains ?? [];
  const pollLabel = meta?.poll_interval
    ? meta.poll_interval.replace("s", "s").replace("60s", "1 min")
    : "1 min";

  const filteredSnapshots =
    selectedChain === "All"
      ? snapshots
      : snapshots.filter((s) => s.chain === selectedChain);

  const visibleSources = new Set(filteredSnapshots.map((s) => s.source));

  const formatNumber = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}K`;
    return `$${v.toFixed(4)}`;
  };

  const metricLabel = (key: string) => {
    const labels: Record<string, string> = {
      tvl: "TVL",
      price: "Price",
      apr: "APR",
      vedust_tvl: "veDUST TVL",
      fees_24h: "Fees (24h)",
      fees_7d: "Fees (7d)",
      fees_30d: "Fees (30d)",
    };
    return labels[key] || key;
  };

  const formatMetric = (key: string, value: number) => {
    if (key === "apr") return `${value.toFixed(2)}%`;
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
  const categories = [...new Set(filteredEvents.map((e) => e.category))];

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

      {/* Live Stats per Source */}
      {filteredSnapshots.map((snap) => (
        <div key={snap.source} className="mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-lg font-semibold capitalize">
              {snap.source}
              <span className="ml-2 text-xs font-normal text-white/30 border border-white/10 rounded px-1.5 py-0.5">
                {snap.chain}
              </span>
            </h2>
            <span className="text-xs text-white/30">
              updated {timeAgo(snap.fetched_at)} · refreshes every {pollLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-white/10 rounded-lg bg-white/5">
            {Object.entries(snap.metrics).map(([key, value]) => (
              <div key={key}>
                <div className="text-white/50 text-xs uppercase mb-1">
                  {metricLabel(key)}
                </div>
                <div className="text-lg font-semibold">
                  {formatMetric(key, value)}
                </div>
                {snap.data_sources?.[key] && (
                  <div className="text-[10px] text-white/25 mt-0.5">
                    via {snap.data_sources[key]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Link Telegram */}
      {!linked && <LinkTelegram onLinked={handleLinked} />}

      {linked && (
        <div className="mb-6 p-3 border border-brand/30 rounded-lg bg-brand/5 text-sm text-brand">
          ✅ Telegram linked (Chat ID: {tgChatId})
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
    </main>
  );
}
