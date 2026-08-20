import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createFolder, deleteFolder, fetchFolders, isUnlocked, lockSite } from "@/lib/diary.functions";
import { THEMES, themeTab, type FolderTheme } from "@/lib/folders";
import { withCache } from "@/lib/local-store";

export const Route = createFileRoute("/folders/")({
  beforeLoad: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Folder Dividers — Athaya's Diary" },
      { name: "description", content: "Folder dividers that keep every diary entry organised." },
      { property: "og:title", content: "Folder Dividers — Athaya's Diary" },
      {
        property: "og:description",
        content: "Folder dividers that keep every diary entry organised.",
      },
    ],
  }),
  component: Folders,
});

function Folders() {
  const router = useRouter();
  const lock = useServerFn(lockSite);
  const load = useServerFn(fetchFolders);
  const add = useServerFn(createFolder);
  const remove = useServerFn(deleteFolder);
  const queryClient = useQueryClient();

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [theme, setTheme] = useState<FolderTheme>("blush");
  const [busy, setBusy] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["folders"],
    queryFn: () => withCache("folders", () => load()),
  });

  async function onAdd() {
    if (!label.trim()) return;
    setBusy(true);
    try {
      await add({ data: { label: label.trim(), theme } });
      await queryClient.invalidateQueries({ queryKey: ["folders"] });
      setLabel("");
      setAdding(false);
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(slug: string, name: string) {
    if (!confirm(`Delete the folder "${name}" and all of its entries?`)) return;
    setBusy(true);
    try {
      await remove({ data: { slug } });
      await queryClient.invalidateQueries({ queryKey: ["folders"] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 pt-14 pb-20">
      <header className="mx-auto flex w-full max-w-md items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl text-foreground">Athaya's Diary</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/backup"
            className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
          >
            Backup
          </Link>
          <button
            onClick={async () => {
              await lock();
              await router.navigate({ to: "/" });
            }}
            className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
          >
            Lock
          </button>
        </div>
      </header>

      <p className="mx-auto mt-2 w-full max-w-md font-serif text-sm italic text-muted-foreground">
        Pick a divider to start reading.
      </p>

      <div className="mx-auto mt-10 w-full max-w-md">
        {isLoading && (
          <p className="font-serif text-sm italic text-muted-foreground">loading folders…</p>
        )}
        {error && (
          <p className="font-serif text-sm text-destructive">
            Couldn't load folders: {(error as Error).message}
          </p>
        )}
        {data?.folders.map((folder, i) => (
          <div
            key={folder.slug}
            className="fade-up relative"
            style={{ animationDelay: `${i * 70}ms`, marginTop: i === 0 ? 0 : "-14px" }}
          >
            <div
              className={`${themeTab(folder.theme)} paper-shadow ml-auto w-40 rounded-t-xl px-4 py-2 font-serif text-sm break-words text-foreground`}
              style={{ marginRight: `${(i % 4) * 2.75}rem` }}
            >
              {folder.label}
            </div>
            <div className="relative">
              <Link
                to="/folders/$folder"
                params={{ folder: folder.slug }}
                aria-label={`Open ${folder.label}`}
                className={`${themeTab(folder.theme)} paper-shadow flex min-h-28 items-end rounded-xl rounded-tr-none px-5 py-5 transition-transform duration-300 hover:-translate-y-1`}
              >
                <span className="max-w-[70%] font-serif text-lg leading-snug break-words text-foreground/80">
                  {folder.label}
                </span>
              </Link>
              <button
                onClick={() => onRemove(folder.slug, folder.label)}
                disabled={busy}
                aria-label={`Delete folder ${folder.label}`}
                className="absolute top-3 right-3 rounded-full bg-card/80 px-3 py-1 text-[10px] tracking-widest uppercase text-muted-foreground transition-colors hover:text-destructive"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {adding ? (
          <div className="paper-shadow mt-6 rounded-xl bg-card px-5 py-5">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="New folder name"
              className="w-full rounded-full border border-border bg-background px-4 py-2 font-serif text-sm text-foreground outline-none focus:border-primary"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  aria-label={t.label}
                  className={`${t.tab} h-9 w-9 rounded-full border-2 transition-transform ${
                    theme === t.id ? "scale-110 border-primary" : "border-border"
                  }`}
                />
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={onAdd}
                disabled={busy}
                className="flex-1 rounded-full bg-primary px-4 py-2 text-[11px] tracking-widest uppercase text-primary-foreground disabled:opacity-50"
              >
                Save folder
              </button>
              <button
                onClick={() => setAdding(false)}
                className="rounded-full border border-border px-4 py-2 text-[11px] tracking-widest uppercase text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-6 w-full rounded-xl border border-dashed border-border py-4 font-serif text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            + Add folder
          </button>
        )}
      </div>
    </main>
  );
}
