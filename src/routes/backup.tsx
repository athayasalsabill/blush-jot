import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { exportAll, importAll, isUnlocked } from "@/lib/diary.functions";
import { downloadSnapshot, parseSnapshot, type Snapshot } from "@/lib/local-store";

export const Route = createFileRoute("/backup")({
  beforeLoad: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Backup — Athaya's Diary" },
      { name: "description", content: "Export your diary to a file or restore it from a backup." },
      { property: "og:title", content: "Backup — Athaya's Diary" },
      {
        property: "og:description",
        content: "Export your diary to a file or restore it from a backup.",
      },
    ],
  }),
  component: Backup,
});

function Backup() {
  const runExport = useServerFn(exportAll);
  const runImport = useServerFn(importAll);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Snapshot | null>(null);

  async function onExport() {
    setBusy(true);
    setMessage("");
    try {
      const data = await runExport();
      downloadSnapshot(data as Snapshot);
      setMessage(`Exported ${data.entries.length} entries.`);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onPick(file: File) {
    try {
      const snapshot = parseSnapshot(await file.text());
      setPending(snapshot);
      setMessage(
        `Loaded ${snapshot.entries.length} entries from the backup file. Choose where to restore them.`,
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function onRestoreToGithub() {
    if (!pending) return;
    setBusy(true);
    try {
      const res = await runImport({
        data: { folders: pending.folders, entries: pending.entries },
      });
      await queryClient.invalidateQueries();
      setMessage(`Uploaded ${res.count} entries to your private GitHub storage.`);
      setPending(null);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="texture-linen min-h-screen px-5 pt-12 pb-20">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/folders"
          className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
        >
          ← Folders
        </Link>
        <h1 className="mt-4 font-serif text-3xl leading-snug break-words text-foreground">
          Backup & restore
        </h1>
        <p className="mt-2 font-serif text-sm italic text-muted-foreground">
          Keep a copy of every entry on your phone, and push it back to GitHub whenever you like.
        </p>

        <section className="paper-shadow mt-8 rounded-2xl bg-card px-5 py-6">
          <h2 className="font-serif text-xl text-foreground">Export</h2>
          <p className="mt-1 font-serif text-sm text-muted-foreground">
            Download all folders and entries as a single JSON file.
          </p>
          <button
            onClick={onExport}
            disabled={busy}
            className="mt-4 w-full rounded-full bg-primary px-4 py-2 text-[11px] tracking-widest uppercase text-primary-foreground disabled:opacity-50"
          >
            {busy ? "working…" : "Export backup file"}
          </button>
        </section>

        <section className="paper-shadow mt-5 rounded-2xl bg-card px-5 py-6">
          <h2 className="font-serif text-xl text-foreground">Import</h2>
          <p className="mt-1 font-serif text-sm text-muted-foreground">
            Pick a backup file, then choose to upload it to your GitHub storage.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPick(file);
            }}
            className="mt-4 w-full font-serif text-sm text-muted-foreground"
          />
          {pending && (
            <button
              onClick={onRestoreToGithub}
              disabled={busy}
              className="mt-4 w-full rounded-full border border-primary px-4 py-2 text-[11px] tracking-widest uppercase text-primary disabled:opacity-50"
            >
              {busy ? "uploading…" : "Update GitHub storage"}
            </button>
          )}
        </section>

        {message && (
          <p className="mt-5 text-center font-serif text-sm italic text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
