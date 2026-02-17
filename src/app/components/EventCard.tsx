"use client";

interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Props {
  event: Event;
  isSubscribed: boolean;
  canToggle: boolean;
  onToggle: () => void;
}

const categoryColors: Record<string, string> = {
  altura: "bg-emerald-900/40 text-emerald-400",
  general: "bg-blue-900/40 text-blue-400",
};

export function EventCard({ event, isSubscribed, canToggle, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
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
        <p className="text-sm text-white/70">{event.description}</p>
      </div>

      <button
        onClick={onToggle}
        disabled={!canToggle}
        className={`ml-4 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isSubscribed
            ? "bg-brand/20 text-brand border border-brand/40 hover:bg-red-900/30 hover:text-red-400 hover:border-red-400/40"
            : "bg-white/10 text-white/60 border border-white/20 hover:bg-brand/20 hover:text-brand hover:border-brand/40"
        } disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {isSubscribed ? "Subscribed ✓" : "Subscribe"}
      </button>
    </div>
  );
}
