"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Protocol {
  name: string;
  slug: string;
  tvl: number;
  logo: string;
  category: string;
  chains: string[];
}

interface Props {
  value: string;
  onChange: (slug: string) => void;
  className?: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

function formatTVL(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function ProtocolSearch({ value, onChange, className }: Props) {
  const [query, setQuery] = useState("");
  const [displayName, setDisplayName] = useState(value);
  const [results, setResults] = useState<Protocol[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update display name when value prop changes
  useEffect(() => {
    setDisplayName(value);
  }, [value]);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/defillama/protocols/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data: Protocol[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
        setHighlightIdx(-1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setDisplayName(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  const handleSelect = (protocol: Protocol) => {
    setDisplayName(protocol.name);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onChange(protocol.slug);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <input
        type="text"
        value={displayName}
        onChange={handleInputChange}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="Search protocol..."
        className={className || "w-40 px-1.5 py-0.5 bg-black border border-white/20 rounded text-white text-sm focus:border-brand focus:outline-none"}
      />
      {loading && (
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">...</span>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-72 max-h-60 overflow-y-auto bg-[#1a1a1a] border border-white/20 rounded-lg shadow-xl">
          {results.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => handleSelect(p)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                i === highlightIdx ? "bg-brand/20 text-brand" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {p.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{p.name}</div>
                <div className="text-[10px] text-white/40 truncate">
                  {p.category} · {formatTVL(p.tvl)}
                </div>
              </div>
              <span className="text-[10px] text-white/30 flex-shrink-0">{formatTVL(p.tvl)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
