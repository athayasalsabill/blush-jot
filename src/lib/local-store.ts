const PREFIX = "athaya-diary:";

export function cacheRead<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function cacheWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

/**
 * Runs a server call, caching the result locally so the app keeps working
 * offline. Falls back to the last cached value when the network is down.
 */
export async function withCache<T>(key: string, run: () => Promise<T>): Promise<T> {
  try {
    const value = await run();
    cacheWrite(key, value);
    return value;
  } catch (error) {
    const cached = cacheRead<T>(key);
    if (cached) return cached;
    throw error;
  }
}

export type Snapshot = {
  version: 1;
  exportedAt: string;
  folders: { slug: string; label: string; theme: string }[];
  entries: { folder: string; slug: string; title: string; date: string; body: string }[];
};

export function downloadSnapshot(snapshot: Snapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `athayas-diary-${snapshot.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseSnapshot(text: string): Snapshot {
  const parsed = JSON.parse(text) as Snapshot;
  if (!parsed || !Array.isArray(parsed.entries) || !Array.isArray(parsed.folders)) {
    throw new Error("This file is not a valid Athaya's Diary backup.");
  }
  return parsed;
}
