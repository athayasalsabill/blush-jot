import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { fetchEntry, isUnlocked, persistEntry } from "@/lib/diary.functions";
import { prettifySlug, slugify } from "@/lib/folders";
import { clearDraft, readDraft, withCache, writeDraft } from "@/lib/local-store";


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
      { title: "Writing — Athaya's Diary" },
      { name: "description", content: "A minimal serif editor for your diary entries." },
      { property: "og:title", content: "Writing — Athaya's Diary" },
      {
        property: "og:description",
        content: "A minimal serif editor for your diary entries.",
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

  const draftSlug = slug || "__new";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const hasDraftRef = useRef(false);

  const { data } = useQuery({
    queryKey: ["entry", folder, slug],
    queryFn: () => withCache(`entry:${folder}:${slug}`, () => load({ data: { folder, slug } })),
    enabled: Boolean(slug),
  });

  // Restore a local draft first — it always wins over the stored version.
  useEffect(() => {
    const draft = readDraft(folder, draftSlug);
    if (draft) {
      hasDraftRef.current = true;
      setTitle(draft.title);
      setDate(draft.date || today());
      setBody(draft.body);
      setMessage("Restored your unsaved draft from this device.");
    }
    setReady(true);
  }, [folder, draftSlug]);

  useEffect(() => {
    if (!ready || hasDraftRef.current) return;
    if (data?.entry) {
      setTitle(data.entry.title);
      setDate(data.entry.date || today());
      setBody(data.entry.body);
    }
  }, [data, ready]);

  // Autosave locally while typing so nothing is lost when leaving the page.
  useEffect(() => {
    if (!ready) return;
    if (!title.trim() && !body.trim()) return;
    const id = setTimeout(() => {
      writeDraft({ folder, slug: draftSlug, title, date, body });
      hasDraftRef.current = true;
      if (status !== "saving") setMessage("Draft saved on this device.");
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, date, body, ready, folder, draftSlug]);

  function saveLocal() {
    if (!title.trim() && !body.trim()) return;
    writeDraft({ folder, slug: draftSlug, title, date, body });
  }

  async function onSave() {
    if (!title.trim()) {
      setStatus("error");
      setMessage("Please add a title first.");
      return;
    }
    saveLocal();
    setStatus("saving");
    setMessage("Saving to GitHub…");
    try {
      await save({
        data: { folder, slug: slug || slugify(title), title: title.trim(), date, body },
      });
      clearDraft(folder, draftSlug);
      hasDraftRef.current = false;
      await queryClient.invalidateQueries({ queryKey: ["entries", folder] });
      setStatus("saved");
      setMessage("Saved to your private GitHub.");
      await router.navigate({ to: "/folders/$folder", params: { folder } });
    } catch (e) {
      setStatus("error");
      setMessage(`Kept on this device — GitHub save failed: ${(e as Error).message}`);
    }
  }

  return (
    <main className="texture-dots min-h-screen px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between px-1">
          <Link
            to="/folders/$folder"
            params={{ folder }}
            onClick={saveLocal}
            className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
          >
            ← {prettifySlug(folder)}
          </Link>
          <button
            onClick={onSave}
            disabled={status === "saving"}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] tracking-widest uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <LockGh />
            {status === "saving" ? "saving…" : "Save"}
          </button>
        </div>


        <section className="paper-shadow fade-up mt-5 rounded-2xl bg-card px-5 py-7">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title"
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
                setMessage("Text only — images are never stored.");
              }
            }}
            onDrop={(e) => e.preventDefault()}
            rows={18}
            placeholder="Write today…"
            className="mt-4 w-full resize-none bg-transparent font-serif text-base leading-8 text-foreground outline-none placeholder:text-muted-foreground"
          />
        </section>

        <p className="mt-3 px-1 text-center font-serif text-xs italic text-muted-foreground">
          {message || "Text only — no images, light on storage."}
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
