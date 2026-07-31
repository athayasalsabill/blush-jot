import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { fetchEntry, isUnlocked, persistEntry } from "@/lib/diary.functions";
import { folderLabel, slugify } from "@/lib/folders";

export const Route = createFileRoute("/folders/$folder/write")({
  validateSearch: (search: Record<string, unknown>) => ({
    slug: typeof search['slug'] === "string" ? (search['slug'] as string) : "",
  }),
  beforeLoad: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Menulis — Blush Diary" },
      { name: "description", content: "Editor teks serif minimalis untuk entri diari kamu." },
      { property: "og:title", content: "Menulis — Blush Diary" },
      {
        property: "og:description",
        content: "Editor teks serif minimalis untuk entri diari kamu.",
      },
    ],
  }),
  component: Writer,
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

function Writer() {
  const { folder } = Route.useParams();
  const { slug } = Route.useSearch();
  const router = useRouter();
  const load = useServerFn(fetchEntry);
  const save = useServerFn(persistEntry);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const { data } = useQuery({
    queryKey: ["entry", folder, slug],
    queryFn: () => load({ data: { folder, slug } }),
    enabled: Boolean(slug),
  });

  useEffect(() => {
    if (data?.entry) {
      setTitle(data.entry.title);
      setDate(data.entry.date || today());
      setBody(data.entry.body);
    }
  }, [data]);

  async function onSave() {
    if (!title.trim()) {
      setStatus("error");
      setMessage("Beri judul dulu ya.");
      return;
    }
    setStatus("saving");
    try {
      await save({
        data: { folder, slug: slug || slugify(title), title: title.trim(), date, body },
      });
      await queryClient.invalidateQueries({ queryKey: ["entries", folder] });
      setStatus("saved");
      setMessage("Tersimpan di GitHub pribadi.");
      await router.navigate({ to: "/folders/$folder", params: { folder } });
    } catch (e) {
      setStatus("error");
      setMessage((e as Error).message);
    }
  }

  return (
    <main className="texture-dots min-h-screen px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between px-1">
          <Link
            to="/folders/$folder"
            params={{ folder }}
            className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
          >
            ← {folderLabel(folder)}
          </Link>
          <button
            onClick={onSave}
            disabled={status === "saving"}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] tracking-widest uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <LockGh />
            {status === "saving" ? "menyimpan…" : "Simpan"}
          </button>
        </div>

        <section className="paper-shadow fade-up mt-5 rounded-2xl bg-card px-5 py-7">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul diari"
            className="w-full bg-transparent font-serif text-2xl leading-snug text-foreground outline-none placeholder:text-muted-foreground"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 bg-transparent text-[11px] tracking-widest uppercase text-muted-foreground outline-none"
          />
          <hr className="mt-4 border-border" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onPaste={(e) => {
              if (Array.from(e.clipboardData.items).some((i) => i.type.startsWith("image/"))) {
                e.preventDefault();
                setStatus("error");
                setMessage("Hanya teks yang diizinkan — gambar tidak disimpan.");
              }
            }}
            onDrop={(e) => e.preventDefault()}
            rows={18}
            placeholder="Tulis hari ini…"
            className="mt-4 w-full resize-none bg-transparent font-serif text-base leading-8 text-foreground outline-none placeholder:text-muted-foreground"
          />
        </section>

        <p className="mt-3 px-1 text-center font-serif text-xs italic text-muted-foreground">
          {message || "Hanya teks — tanpa gambar, hemat memori."}
        </p>
      </div>
    </main>
  );
}

function LockGh() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" opacity="0.9" />
      <path
        d="M8 10V7.5a4 4 0 1 1 8 0V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="12" y="18.4" textAnchor="middle" fontSize="7" fill="var(--primary)">
        GH
      </text>
    </svg>
  );
}
