type Entry<T> = { value?: T; fetchedAt?: string; expires: number; pending?: Promise<{ value: T; fetchedAt: string }>; failedUntil?: number };
const cache = new Map<string, Entry<unknown>>();
const windows = new Map<string, { start: number; count: number }>();
const USER_AGENT = "Flightlo/0.2 (public airport reference application)";

export async function sourceValue<T>(key: string, ttl: number, load: () => Promise<T>): Promise<{ value: T; fetchedAt: string }> {
  let entry = cache.get(key) as Entry<T> | undefined;
  if (!entry) {
    // Never evict an in-flight fetch: duplicate requests must share it.
    if (cache.size >= 256) {
      const victim = [...cache].find(([, item]) => !item.pending);
      if (victim) cache.delete(victim[0]);
      else throw new Error("Public source cache is busy");
    }
    entry = { expires: 0 };
    cache.set(key, entry);
  }
  if (entry.value !== undefined && entry.expires > Date.now()) return { value: entry.value, fetchedAt: entry.fetchedAt! };
  if (entry.pending) return entry.pending;
  if ((entry.failedUntil ?? 0) > Date.now()) throw new Error("Source is cooling down after an unavailable response");
  const current = entry;
  current.pending = load().then(value => {
    const fetchedAt = new Date().toISOString();
    current.value = value;
    current.fetchedAt = fetchedAt;
    current.expires = Date.now() + ttl;
    return { value, fetchedAt };
  }).catch(error => {
    current.failedUntil = Date.now() + 60_000;
    throw error;
  }).finally(() => { current.pending = undefined; });
  return current.pending;
}

export async function publicFetch(url: string): Promise<Response> {
  const host = new URL(url).hostname;
  const now = Date.now();
  let window = windows.get(host);
  if (!window || now - window.start >= 60_000) {
    window = { start: now, count: 0 };
    windows.set(host, window);
  }
  // Below AWC's documented 100/minute ceiling; applies across both products.
  if (++window.count > 40) throw new Error("Public provider request budget reached; retry later");
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json,text/csv;q=0.8" }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Public source HTTP ${response.status}`);
  return response;
}

export async function publicJson(url: string): Promise<unknown> {
  const response = await publicFetch(url);
  if (response.status === 204) return [];
  return response.json();
}

export function safeWebLink(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
