"use client";

import { useState } from "react";

interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Props {
  event: Event;
  canToggle: boolean;
  isSubscribed?: boolean;
  onSubscribe: (
    eventId: number,
    thresholdPct?: number,
    windowMinutes?: number,
    direction?: string,
    reportHour?: number
  ) => void;
  onUnsubscribe?: (eventId: number) => void;
}

const categoryColors: Record<string, string> = {
  altura: "bg-emerald-900/40 text-emerald-400",
  neverland: "bg-purple-900/40 text-purple-400",
  general: "bg-blue-900/40 text-blue-400",
};

export function EventCard({
  event,
  canToggle,
  isSubscribed,
  onSubscribe,
  onUnsubscribe,
}: Props) {
  const isMetricAlert = event.name.endsWith("_metric_alert");

  const [direction, setDirection] = useState("drop");
  const [thresholdPct, setThresholdPct] = useState(10);
  const [windowMinutes, setWindowMinutes] = useState(1);
  const [reportHour, setReportHour] = useState(8);

  const isDailyReport = event.name.endsWith("_daily_report");

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

          {isMetricAlert ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event.description}</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-sm focus:border-brand focus:outline-none cursor-pointer"
              >
                <option value="drop">drop</option>
                <option value="increase">increase</option>
              </select>
              <span>&gt;</span>
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
          ) : isDailyReport ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event.description} at</span>
              <select
                value={reportHour}
                onChange={(e) => setReportHour(Number(e.target.value))}
                className="px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-sm focus:border-brand focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span>UTC+8</span>
            </div>
          ) : (
            <p className="text-sm text-white/70">{event.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {isMetricAlert ? (
            <button
              onClick={() =>
                onSubscribe(event.id, thresholdPct, windowMinutes, direction)
              }
              disabled={!canToggle}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white/60 border border-white/20 hover:bg-brand/20 hover:text-brand hover:border-brand/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Subscribe
            </button>
          ) : isDailyReport ? (
            <button
              onClick={() =>
                onSubscribe(event.id, undefined, undefined, undefined, reportHour)
              }
              disabled={!canToggle}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white/60 border border-white/20 hover:bg-brand/20 hover:text-brand hover:border-brand/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Subscribe
            </button>
          ) : (
            <button
              onClick={() =>
                isSubscribed
                  ? onUnsubscribe?.(event.id)
                  : onSubscribe(event.id)
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
          )}
        </div>
      </div>
    </div>
  );
}
