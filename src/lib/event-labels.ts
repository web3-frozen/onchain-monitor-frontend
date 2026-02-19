// Centralized source label + color mapping for event names.
// Both EventCard and SubscriptionRow import from here to stay in sync.
// When adding a new event/source, add its entry here only.
export const sourceLabels: Record<string, { label: string; color: string }> = {
  general_metric_alert:        { label: "Fear & Greed", color: "bg-sky-900/50 text-sky-400 border-sky-500/30" },
  general_daily_report:        { label: "Fear & Greed", color: "bg-sky-900/50 text-sky-400 border-sky-500/30" },
  general_maxpain_alert:       { label: "MaxPain",      color: "bg-orange-900/50 text-orange-400 border-orange-500/30" },
  general_merkl_alert:         { label: "Merkl",        color: "bg-teal-900/50 text-teal-400 border-teal-500/30" },
  general_turtle_alert:        { label: "Turtle",       color: "bg-green-900/50 text-green-400 border-green-500/30" },
  general_binance_price_alert: { label: "Binance",      color: "bg-yellow-900/50 text-yellow-400 border-yellow-500/30" },
  general_alpha_alert:         { label: "Alpha",        color: "bg-pink-900/50 text-pink-400 border-pink-500/30" },
  altura_metric_alert:         { label: "Altura",       color: "bg-emerald-900/50 text-emerald-400 border-emerald-500/30" },
  altura_daily_report:         { label: "Altura",       color: "bg-emerald-900/50 text-emerald-400 border-emerald-500/30" },
  neverland_metric_alert:      { label: "Neverland",    color: "bg-purple-900/50 text-purple-400 border-purple-500/30" },
  neverland_daily_report:      { label: "Neverland",    color: "bg-purple-900/50 text-purple-400 border-purple-500/30" },
};
