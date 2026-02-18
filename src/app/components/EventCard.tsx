"use client";

import { useState, useEffect } from "react";

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
}

interface Props {
  event: Event;
  isSubscribed: boolean;
  subscription?: Subscription;
  canToggle: boolean;
  onSubscribe: (
    eventId: number,
    thresholdPct?: number,
    windowMinutes?: number
  ) => void;
  onUnsubscribe: (eventId: number) => void;
}

const categoryColors: Record<string, string> = {
  altura: "bg-emerald-900/40 text-emerald-400",
  neverland: "bg-purple-900/40 text-purple-400",
  general: "bg-blue-900/40 text-blue-400",
};

export function EventCard({
  event,
  isSubscribed,
  subscription,
  canToggle,
  onSubscribe,
  onUnsubscribe,
}: Props) {
  const isDropEvent = event.name.endsWith("_drop");

  const [thresholdPct, setThresholdPct] = useState(
    subscription?.threshold_pct ?? 10
  );
  const [windowMinutes, setWindowMinutes] = useState(
    subscription?.window_minutes ?? 1
  );

  useEffect(() => {
    if (subscription) {
      setThresholdPct(subscription.threshold_pct);
      setWindowMinutes(subscription.window_minutes);
    }
  }, [subscription]);

  const hasChanges =
    isSubscribed &&
    subscription &&
    (thresholdPct !== subscription.threshold_pct ||
      windowMinutes !== subscription.window_minutes);

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded uppercase ${
                categoryColors[event.category] || categoryColors.general
              }`}
            >
              {event.category}
            </span>
          </div>

          {isDropEvent ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event.description} &gt;</span>
              <input
                type="number"
                min={1}
                max={100}
                value={thresholdPct}
                onChange={(e) => setThresholdPct(Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-center text-sm focus:border-brand focus:outline-none"
              />
              <span>% in</span>
              <input
                type="number"
                min={1}
                max={60}
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-center text-sm focus:border-brand focus:outline-none"
              />
              <span>minute(s)</span>
            </div>
          ) : (
            <p className="text-sm text-white/70">{event.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {isSubscribed && hasChanges && (
            <button
              onClick={() =>
                onSubscribe(event.id, thresholdPct, windowMinutes)
              }
              disabled={!canToggle}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/20 text-brand border border-brand/40 hover:bg-brand/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Save
            </button>
          )}
          <button
            onClick={() =>
              isSubscribed
                ? onUnsubscribe(event.id)
                : onSubscribe(event.id, thresholdPct, windowMinutes)
            }
            disabled={!canToggle}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isSubscribed
                ? "bg-brand/20 text-brand border border-brand/40 hover:bg-red-900/30 hover:text-red-400 hover:border-red-400/40"
                : "bg-white/10 text-white/60 border border-white/20 hover:bg-brand/20 hover:text-brand hover:border-brand/40"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {isSubscribed ? "Subscribed ✓" : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
}
