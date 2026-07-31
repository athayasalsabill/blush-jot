const GATEWAY_URL = "https://connector-gateway.lovable.dev/github";

function headers() {
  const lovableKey = process.env['LOVABLE_API_KEY'];
  const githubKey = process.env['GITHUB_API_KEY'];
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!githubKey) throw new Error("GITHUB_API_KEY is not configured");
  return {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": githubKey,
  };
}

async function gh(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY_URL}/${path}`, { ...init, headers: headers() });
  return res;
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

let cachedRepo: { owner: string; repo: string } | null = null;

export async function ensureRepo(): Promise<{ owner: string; repo: string }> {
  if (cachedRepo) return cachedRepo;
  const repo = process.env['GITHUB_REPO'] || "blush-diary";

  const meRes = await gh("user");
  if (!meRes.ok) {
    throw new Error(`GitHub user lookup failed [${meRes.status}]: ${await meRes.text()}`);
  }
  const owner = ((await meRes.json()) as { login: string }).login;

  const repoRes = await gh(`repos/${owner}/${repo}`);
  if (repoRes.status === 404) {
    const created = await gh("user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: repo,
        private: true,
        auto_init: true,
        description: "Blush Diary entries",
      }),
    });
    if (!created.ok) {
      throw new Error(`Could not create repo [${created.status}]: ${await created.text()}`);
    }
  } else if (!repoRes.ok) {
    throw new Error(`Repo lookup failed [${repoRes.status}]: ${await repoRes.text()}`);
  }

  cachedRepo = { owner, repo };
  return cachedRepo;
}

export type EntryFile = { slug: string; title: string; date: string; excerpt: string };

function parseEntry(raw: string): { title: string; date: string; body: string } {
  const lines = raw.split("\n");
  let title = "Untitled";
  let date = "";
  let bodyStart = 0;
  if (lines[0]?.startsWith("# ")) {
    title = lines[0].slice(2).trim();
    bodyStart = 1;
  }
  if (lines[bodyStart]?.startsWith("date: ")) {
    date = lines[bodyStart].slice(6).trim();
    bodyStart += 1;
  }
  return { title, date, body: lines.slice(bodyStart).join("\n").replace(/^\n+/, "") };
}

export function serializeEntry(title: string, date: string, body: string) {
  return `# ${title}\ndate: ${date}\n\n${body}\n`;
}

export async function listEntries(folder: string): Promise<EntryFile[]> {
  const { owner, repo } = await ensureRepo();
  const res = await gh(`repos/${owner}/${repo}/contents/${encodeURIComponent(folder)}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`List failed [${res.status}]: ${await res.text()}`);
  const files = (await res.json()) as Array<{ name: string; type: string }>;
  const txt = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  const entries = await Promise.all(
    txt.map(async (f) => {
      const slug = f.name.replace(/\.md$/, "");
      const entry = await getEntry(folder, slug);
      return {
        slug,
        title: entry?.title || slug,
        date: entry?.date || "",
        excerpt: (entry?.body || "").replace(/\s+/g, " ").slice(0, 160),
      };
    }),
  );
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getEntry(folder: string, slug: string) {
  const { owner, repo } = await ensureRepo();
  const res = await gh(
    `repos/${owner}/${repo}/contents/${encodeURIComponent(folder)}/${encodeURIComponent(slug)}.md`,
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Read failed [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as { content: string; sha: string };
  const parsed = parseEntry(decodeBase64(data.content));
  return { ...parsed, sha: data.sha, slug };
}

export async function saveEntry(input: {
  folder: string;
  slug: string;
  title: string;
  date: string;
  body: string;
}) {
  const { owner, repo } = await ensureRepo();
  const path = `${encodeURIComponent(input.folder)}/${encodeURIComponent(input.slug)}.md`;
  const existing = await getEntry(input.folder, input.slug);
  const res = await gh(`repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `diary: ${input.title}`,
      content: encodeBase64(serializeEntry(input.title, input.date, input.body)),
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Save failed [${res.status}]: ${await res.text()}`);
  return { ok: true as const };
}
