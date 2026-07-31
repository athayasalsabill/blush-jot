import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchEntries, isUnlocked } from "@/lib/diary.functions";
import { folderLabel } from "@/lib/folders";

export const Route = createFileRoute("/folders/$folder/")({
  beforeLoad: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/" });
  },
  head: ({ params }) => {
    const title = `${folderLabel(params.folder)} — Blush Diary`;
    return {
      meta: [
        { title },
        { name: "description", content: `Entri diari dalam map ${folderLabel(params.folder)}.` },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Entri diari dalam map ${folderLabel(params.folder)}.`,
        },
      ],
    };
  },
  component: EntryList,
});

function EntryList() {
  const { folder } = Route.useParams();
  const load = useServerFn(fetchEntries);
  const { data, isLoading, error } = useQuery({
    queryKey: ["entries", folder],
    queryFn: () => load({ data: { folder } }),
  });

  return (
    <main className="min-h-screen bg-card px-5 pt-12 pb-28">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/folders"
          className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
        >
          ← Map
        </Link>
        <h1 className="mt-4 font-serif text-3xl text-foreground">{folderLabel(folder)}</h1>

        <div className="mt-8 divide-y divide-border">
          {isLoading && (
            <p className="py-6 font-serif text-sm italic text-muted-foreground">memuat entri…</p>
          )}
          {error && (
            <p className="py-6 font-serif text-sm text-destructive">
              Tidak bisa memuat entri: {(error as Error).message}
            </p>
          )}
          {data?.entries.length === 0 && (
            <p className="py-6 font-serif text-sm italic text-muted-foreground">
              Belum ada entri di map ini.
            </p>
          )}
          {data?.entries.map((entry) => (
            <Link
              key={entry.slug}
              to="/folders/$folder/write"
              params={{ folder }}
              search={{ slug: entry.slug }}
              className="fade-up block py-6 transition-opacity hover:opacity-70"
            >
              <h2 className="font-serif text-xl leading-snug text-foreground">{entry.title}</h2>
              <p className="mt-1 text-[11px] tracking-widest uppercase text-muted-foreground">
                {entry.date}
              </p>
              <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
                {entry.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <Link
        to="/folders/$folder/write"
        params={{ folder }}
        search={{ slug: "" }}
        aria-label="Entri baru"
        className="paper-shadow fixed right-6 bottom-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-3xl leading-none text-primary-foreground transition-transform hover:scale-105"
      >
        +
      </Link>
    </main>
  );
}
