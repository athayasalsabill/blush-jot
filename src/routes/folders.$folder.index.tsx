import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { fetchEntries, fetchFolders, isUnlocked, removeEntry } from "@/lib/diary.functions";
import { prettifySlug, themePage } from "@/lib/folders";
import { clearDraft, listDrafts, withCache, type Draft } from "@/lib/local-store";


export const Route = createFileRoute("/folders/$folder/")({
  beforeLoad: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/" });
  },
  head: ({ params }) => {
    const title = `${prettifySlug(params.folder)} — Athaya's Diary`;
    return {
      meta: [
        { title },
        { name: "description", content: `Diary entries in the ${prettifySlug(params.folder)} folder.` },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Diary entries in the ${prettifySlug(params.folder)} folder.`,
        },
      ],
    };
  },
  component: EntryList,
});

function EntryList() {
  const { folder } = Route.useParams();
  const load = useServerFn(fetchEntries);
  const loadFolders = useServerFn(fetchFolders);
  const del = useServerFn(removeEntry);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["entries", folder],
    queryFn: () => withCache(`entries:${folder}`, () => load({ data: { folder } })),
  });

  const { data: foldersData } = useQuery({
    queryKey: ["folders"],
    queryFn: () => withCache("folders", () => loadFolders()),
  });

  const current = foldersData?.folders.find((f) => f.slug === folder);
  const label = current?.label ?? prettifySlug(folder);
  const bg = current ? themePage(current.theme) : "bg-card";

  async function onDelete(slug: string, title: string) {
    if (!confirm(`Delete the entry "${title}"?`)) return;
    setBusy(true);
    try {
      await del({ data: { folder, slug } });
      await queryClient.invalidateQueries({ queryKey: ["entries", folder] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`${bg} min-h-screen px-5 pt-12 pb-28`}>
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/folders"
          className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
        >
          ← Folders
        </Link>
        <h1 className="mt-4 font-serif text-3xl leading-snug break-words text-foreground">{label}</h1>

        <div className="mt-8 divide-y divide-border rounded-2xl bg-card/85 px-4">
          {isLoading && (
            <p className="py-6 font-serif text-sm italic text-muted-foreground">loading entries…</p>
          )}
          {error && (
            <p className="py-6 font-serif text-sm text-destructive">
              Couldn't load entries: {(error as Error).message}
            </p>
          )}
          {data?.entries.length === 0 && (
            <p className="py-6 font-serif text-sm italic text-muted-foreground">
              No entries in this folder yet.
            </p>
          )}
          {data?.entries.map((entry) => (
            <div key={entry.slug} className="fade-up flex items-start gap-3 py-6">
              <Link
                to="/folders/$folder/write"
                params={{ folder }}
                search={{ slug: entry.slug }}
                className="block flex-1 transition-opacity hover:opacity-70"
              >
                <h2 className="font-serif text-xl leading-snug text-foreground">{entry.title}</h2>
                <p className="mt-1 text-[11px] tracking-widest uppercase text-muted-foreground">
                  {entry.date}
                </p>
                <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
                  {entry.excerpt}
                </p>
              </Link>
              <button
                onClick={() => onDelete(entry.slug, entry.title)}
                disabled={busy}
                aria-label={`Delete entry ${entry.title}`}
                className="mt-1 rounded-full border border-border px-3 py-1 text-[10px] tracking-widest uppercase text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/folders/$folder/write"
        params={{ folder }}
        search={{ slug: "" }}
        aria-label="New entry"
        className="paper-shadow fixed right-6 bottom-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-3xl leading-none text-primary-foreground transition-transform hover:scale-105"
      >
        +
      </Link>
    </main>
  );
}
