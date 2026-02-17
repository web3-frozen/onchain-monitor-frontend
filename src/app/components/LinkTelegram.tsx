"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface Props {
  onLinked: (chatId: number) => void;
}

export function LinkTelegram({ onLinked }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resp = await fetch(`${API}/api/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase().trim() }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        setError(data.error || "Invalid or expired link code");
        return;
      }

      const user = await resp.json();
      onLinked(user.tg_chat_id);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 border border-white/10 rounded-lg bg-white/5">
      <h2 className="text-lg font-semibold mb-2">Link your Telegram</h2>
      <p className="text-white/50 text-sm mb-4">
        1. Open Telegram and message{" "}
        <span className="text-brand">@OnchainMonitorBot</span> with{" "}
        <code className="bg-white/10 px-1 rounded">/start</code>
        <br />
        2. Enter the 6-character code below
      </p>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code (e.g. A1B2C3)"
          maxLength={6}
          className="flex-1 px-4 py-2 bg-black border border-white/20 rounded-lg text-white uppercase tracking-widest text-center font-mono focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={code.length < 6 || loading}
          className="px-6 py-2 bg-brand text-black font-semibold rounded-lg hover:bg-brand/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "..." : "Link"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
