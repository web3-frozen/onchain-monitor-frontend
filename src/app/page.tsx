"use client";

import { useEffect, useState, useCallback } from "react";
import { LinkTelegram } from "./components/LinkTelegram";
import { EventCard } from "./components/EventCard";

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
}

interface Stats {
  source: string;
  tvl: number;
  price: number;
  apr: number;
  fetched_at: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
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
      .then(setStats)
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

  const handleToggle = async (eventId: number, isSubscribed: boolean) => {
    if (!tgChatId) return;

    if (isSubscribed) {
      const sub = subs.find((s) => s.event_id === eventId);
      if (sub) {
        await fetch(`${API}/api/subscriptions/${sub.id}`, { method: "DELETE" });
      }
    } else {
      await fetch(`${API}/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tg_chat_id: tgChatId, event_id: eventId }),
      });
    }
    loadSubs();
  };

  const subscribedEventIds = new Set(subs.map((s) => s.event_id));

  const formatNumber = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}K`;
    return `$${v.toFixed(2)}`;
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-brand mb-2">Onchain Monitor</h1>
      <p className="text-white/50 mb-8">
        Monitor on-chain stats and subscribe to Telegram alerts
      </p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-10 p-4 border border-white/10 rounded-lg bg-white/5">
          <div>
            <div className="text-white/50 text-xs uppercase mb-1">TVL</div>
            <div className="text-lg font-semibold">
              {formatNumber(stats.tvl)}
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase mb-1">
              AVLT Price
            </div>
            <div className="text-lg font-semibold">
              ${stats.price.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase mb-1">APR</div>
            <div className="text-lg font-semibold text-brand">
              {stats.apr.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Link Telegram */}
      {!linked && <LinkTelegram onLinked={handleLinked} />}

      {linked && (
        <div className="mb-6 p-3 border border-brand/30 rounded-lg bg-brand/5 text-sm text-brand">
          ✅ Telegram linked (Chat ID: {tgChatId})
        </div>
      )}

      {/* Events */}
      <h2 className="text-xl font-semibold mb-4">Available Alerts</h2>
      <div className="space-y-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isSubscribed={subscribedEventIds.has(event.id)}
            canToggle={linked}
            onToggle={() =>
              handleToggle(event.id, subscribedEventIds.has(event.id))
            }
          />
        ))}
      </div>

      {events.length === 0 && (
        <p className="text-white/30 text-center py-8">Loading events...</p>
      )}
    </main>
  );
}
