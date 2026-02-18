"use client";

import { useState, useEffect } from "react";

interface Subscription {
  id: number;
  event_id: number;
  threshold_pct: number;
  window_minutes: number;
  direction: string;
  report_hour: number;
  threshold_value: number;
  coin: string;
}

interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Props {
  subscription: Subscription;
  event?: Event;
  onUpdate: (
    subId: number,
    thresholdPct: number,
    windowMinutes: number,
    direction: string,
    reportHour: number,
    thresholdValue: number,
    coin: string
  ) => void;
  onDelete: (subId: number) => void;
}

const categoryColors: Record<string, string> = {
  altura: "bg-emerald-900/40 text-emerald-400",
  neverland: "bg-purple-900/40 text-purple-400",
  general: "bg-blue-900/40 text-blue-400",
};

export function SubscriptionRow({
  subscription,
  event,
  onUpdate,
  onDelete,
}: Props) {
  const isMetricAlert = event?.name.endsWith("_metric_alert");
  const isDailyReport = event?.name.endsWith("_daily_report");
  const isMaxpainAlert = event?.name === "general_maxpain_alert";
  const isMerklAlert = event?.name === "general_merkl_alert";
  const isValueAlert = isMetricAlert && event?.category === "general";

  const [direction, setDirection] = useState(subscription.direction);
  const [thresholdPct, setThresholdPct] = useState(subscription.threshold_pct);
  const [windowMinutes, setWindowMinutes] = useState(
    subscription.window_minutes
  );
  const [reportHour, setReportHour] = useState(subscription.report_hour ?? 8);
  const [thresholdValue, setThresholdValue] = useState(
    subscription.threshold_value ?? 50
  );
  const [coin, setCoin] = useState(subscription.coin ?? "BTC");

  useEffect(() => {
    setDirection(subscription.direction);
    setThresholdPct(subscription.threshold_pct);
    setWindowMinutes(subscription.window_minutes);
    setReportHour(subscription.report_hour ?? 8);
    setThresholdValue(subscription.threshold_value ?? 50);
    setCoin(subscription.coin ?? "BTC");
  }, [subscription]);

  const hasChanges =
    direction !== subscription.direction ||
    thresholdPct !== subscription.threshold_pct ||
    windowMinutes !== subscription.window_minutes ||
    reportHour !== (subscription.report_hour ?? 8) ||
    thresholdValue !== (subscription.threshold_value ?? 0) ||
    coin !== (subscription.coin ?? "");

  const category = event?.category ?? "general";

  const inputCls =
    "w-14 px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-center text-sm focus:border-brand focus:outline-none";
  const selectCls =
    "px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-sm focus:border-brand focus:outline-none cursor-pointer";

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded uppercase ${
                categoryColors[category] || categoryColors.general
              }`}
            >
              {category}
            </span>
          </div>

          {isMerklAlert ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>Alert when</span>
              <select
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className={selectCls}
              >
                {["ALL", "LEND", "BORROW", "HOLD", "LEND,HOLD"].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <span>APR &ge;</span>
              <input
                type="number"
                min={1}
                max={500}
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                className={inputCls}
              />
              <span>% TVL &ge;</span>
              <input
                type="number"
                min={0.1}
                max={100}
                step={0.1}
                value={thresholdPct}
                onChange={(e) => setThresholdPct(Number(e.target.value))}
                className={inputCls}
              />
              <span>M</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className={selectCls}
              >
                <option value="stablecoin">Stablecoin only</option>
                <option value="non-stablecoin">Non-stablecoin</option>
                <option value="any">Any token</option>
              </select>
            </div>
          ) : isMaxpainAlert ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>Alert when</span>
              <select
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className={selectCls}
              >
                {["BTC", "ETH"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className={selectCls}
              >
                <option value={720}>12h</option>
                <option value={1440}>24h</option>
                <option value={2880}>48h</option>
                <option value={4320}>3d</option>
                <option value={10080}>7d</option>
                <option value={20160}>2w</option>
                <option value={43200}>1M</option>
              </select>
              <span>price within</span>
              <input
                type="number"
                min={0.1}
                max={50}
                step={0.1}
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                className={inputCls}
              />
              <span>% of</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className={selectCls}
              >
                <option value="long">long max pain</option>
                <option value="short">short max pain</option>
              </select>
            </div>
          ) : isValueAlert ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event?.description}</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className={selectCls}
              >
                <option value="higher">higher than</option>
                <option value="lower">lower than</option>
              </select>
              <input
                type="number"
                min={0}
                max={100}
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                className={inputCls}
              />
            </div>
          ) : isMetricAlert ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event?.description}</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className={selectCls}
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
                className={inputCls}
              />
              <span>% in</span>
              <input
                type="number"
                min={1}
                max={60}
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className={inputCls}
              />
              <span>minute(s)</span>
            </div>
          ) : isDailyReport ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event?.description.replace(/^Daily UTC\+8 report\s*—\s*/, (event?.category.charAt(0).toUpperCase() + event?.category.slice(1)) + " report — ")} at</span>
              <select
                value={reportHour}
                onChange={(e) => setReportHour(Number(e.target.value))}
                className={selectCls}
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
            <p className="text-sm text-white/70">{event?.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {(isMetricAlert || isDailyReport || isMaxpainAlert || isMerklAlert) && hasChanges && (
            <button
              onClick={() =>
                onUpdate(subscription.id, thresholdPct, windowMinutes, direction, reportHour, thresholdValue, coin)
              }
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/20 text-brand border border-brand/40 hover:bg-brand/30 transition-all"
            >
              Save
            </button>
          )}
          <button
            onClick={() => onDelete(subscription.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white/40 border border-white/10 hover:bg-red-900/30 hover:text-red-400 hover:border-red-400/40 transition-all"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
