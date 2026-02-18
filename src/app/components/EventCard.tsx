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
    reportHour?: number,
    thresholdValue?: number,
    coin?: string
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
  const isDailyReport = event.name.endsWith("_daily_report");
  const isMaxpainAlert = event.name === "general_maxpain_alert";
  const isMerklAlert = event.name === "general_merkl_alert";
  const isGeneralMetric = isMetricAlert && event.category === "general";
  const [alertMode, setAlertMode] = useState<"pct" | "value">(isGeneralMetric ? "value" : "pct");
  const [direction, setDirection] = useState(isMerklAlert ? "any" : isMaxpainAlert ? "long" : isGeneralMetric ? "higher" : "drop");
  const [thresholdPct, setThresholdPct] = useState(isMerklAlert ? 1 : 10);
  const [windowMinutes, setWindowMinutes] = useState(isMaxpainAlert ? 1440 : 1);
  const [reportHour, setReportHour] = useState(8);
  const [thresholdValue, setThresholdValue] = useState(isMerklAlert ? 10 : isMaxpainAlert ? 1 : 50);
  const [coin, setCoin] = useState(isMerklAlert ? "ALL" : "BTC");

  const inputCls =
    "w-14 px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-center text-sm focus:border-brand focus:outline-none";
  const selectCls =
    "px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-sm focus:border-brand focus:outline-none cursor-pointer";
  const btnCls =
    "px-4 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white/60 border border-white/20 hover:bg-brand/20 hover:text-brand hover:border-brand/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed";

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
            {isMaxpainAlert && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-500/30 font-semibold uppercase tracking-wider">
                Beta
              </span>
            )}
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
            <>
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
              <p className="text-[11px] text-amber-400/70 mt-1.5">
                ⚠️ Beta feature — still under testing. Not recommended to enable unless you are aware of potential inaccuracies.
              </p>
            </>
          ) : isMetricAlert ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event.description}</span>
              {isGeneralMetric && (
                <select
                  value={alertMode}
                  onChange={(e) => {
                    const mode = e.target.value as "pct" | "value";
                    setAlertMode(mode);
                    setDirection(mode === "value" ? "higher" : "drop");
                  }}
                  className={selectCls}
                >
                  <option value="value">threshold</option>
                  <option value="pct">% change</option>
                </select>
              )}
              {alertMode === "value" && isGeneralMetric ? (
                <>
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
                </>
              ) : (
                <>
                  {!isGeneralMetric && (
                    <select
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                      className={selectCls}
                    >
                      <option value="drop">drop</option>
                      <option value="increase">increase</option>
                    </select>
                  )}
                  {isGeneralMetric && (
                    <select
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                      className={selectCls}
                    >
                      <option value="drop">drop</option>
                      <option value="increase">increase</option>
                    </select>
                  )}
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
                </>
              )}
            </div>
          ) : isDailyReport ? (
            <div className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap mt-1">
              <span>{event.description.replace(/^Daily UTC\+8 report\s*—\s*/, event.category.charAt(0).toUpperCase() + event.category.slice(1) + " report — ")} at</span>
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
            <p className="text-sm text-white/70">{event.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {isMerklAlert ? (
            <button
              onClick={() =>
                onSubscribe(event.id, thresholdPct, undefined, direction, undefined, thresholdValue, coin)
              }
              disabled={!canToggle}
              className={btnCls}
            >
              Subscribe
            </button>
          ) : isMaxpainAlert ? (
            <button
              onClick={() =>
                onSubscribe(event.id, undefined, windowMinutes, direction, undefined, thresholdValue, coin)
              }
              disabled={!canToggle}
              className={btnCls}
            >
              Subscribe
            </button>
          ) : isMetricAlert ? (
            <button
              onClick={() =>
                alertMode === "value" && isGeneralMetric
                  ? onSubscribe(event.id, undefined, undefined, direction, undefined, thresholdValue)
                  : onSubscribe(event.id, thresholdPct, windowMinutes, direction)
              }
              disabled={!canToggle}
              className={btnCls}
            >
              Subscribe
            </button>
          ) : isDailyReport ? (
            <button
              onClick={() =>
                onSubscribe(event.id, undefined, undefined, undefined, reportHour)
              }
              disabled={!canToggle}
              className={btnCls}
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
