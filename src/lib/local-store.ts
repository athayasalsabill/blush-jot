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

/* ---------------- Local drafts ---------------- */

export type Draft = {
  folder: string;
  slug: string;
  title: string;
  date: string;
  body: string;
  updatedAt: string;
};

const DRAFT_PREFIX = PREFIX + "draft:";

function draftKey(folder: string, slug: string) {
  return `${DRAFT_PREFIX}${folder}/${slug}`;
}

export function readDraft(folder: string, slug: string): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(folder, slug));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: Omit<Draft, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      draftKey(draft.folder, draft.slug),
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* storage unavailable */
  }
}

export function clearDraft(folder: string, slug: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(folder, slug));
  } catch {
    /* storage unavailable */
  }
}

export function listDrafts(folder: string): Draft[] {
  if (typeof window === "undefined") return [];
  const out: Draft[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(`${DRAFT_PREFIX}${folder}/`)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const draft = JSON.parse(raw) as Draft;
      if (draft.folder === folder) out.push(draft);
    }
  } catch {
    return out;
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}
