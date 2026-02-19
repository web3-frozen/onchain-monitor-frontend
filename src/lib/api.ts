import type {
  Event,
  Subscription,
  Snapshot,
  StatsMeta,
  SubscribeParams,
  UpdateSubscriptionParams,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as unknown as T);
}

export const api = {
  listEvents(): Promise<Event[]> {
    return request("/api/events");
  },

  listSnapshots(): Promise<Snapshot[]> {
    return request<Snapshot | Snapshot[]>("/api/stats").then((data) =>
      Array.isArray(data) ? data : [data]
    );
  },

  getStatsMeta(): Promise<StatsMeta> {
    return request("/api/stats/meta");
  },

  listSubscriptions(tgChatId: number): Promise<Subscription[]> {
    return request(`/api/subscriptions?tg_chat_id=${tgChatId}`);
  },

  async subscribe(params: SubscribeParams): Promise<void> {
    await request("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  },

  async updateSubscription(
    id: number,
    params: UpdateSubscriptionParams
  ): Promise<void> {
    await request(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  },

  async deleteSubscription(id: number): Promise<void> {
    await request(`/api/subscriptions/${id}`, { method: "DELETE" });
  },

  async linkTelegram(code: string): Promise<{ tg_chat_id: number }> {
    return request("/api/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  },

  async unlinkTelegram(tgChatId: number): Promise<void> {
    await request("/api/unlink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tg_chat_id: tgChatId }),
    });
  },
};
