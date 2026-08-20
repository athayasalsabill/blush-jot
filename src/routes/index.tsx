import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { isUnlocked, unlockSite } from "@/lib/diary.functions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { unlocked } = await isUnlocked();
    if (unlocked) throw redirect({ to: "/folders" });
  },
  head: () => ({
    meta: [
      { title: "Athaya's Diary — A private text diary" },
      {
        name: "description",
        content:
          "A minimal text-only diary. Enter your password to read and write private notes.",
      },
      { property: "og:title", content: "Athaya's Diary — A private text diary" },
      {
        property: "og:description",
        content: "A minimal text-only diary. Enter your password to read and write private notes.",
      },
    ],
  }),
  component: Gate,
});

function Gate() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const password = new FormData(e.currentTarget).get("password") as string;
    const { ok } = await unlock({ data: { password } });
    setBusy(false);
    if (ok) await router.navigate({ to: "/folders" });
    else setError(true);
  }

  return (
    <main className="texture-polka-mono flex min-h-screen items-center justify-center px-6">
      <div className="paper-shadow fade-up w-full max-w-sm rounded-2xl bg-card px-7 py-12 text-center">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Athaya's Diary</h1>
        <p className="mt-2 font-serif text-sm italic text-muted-foreground">
          for your eyes only
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="password"
            className="w-full rounded-full border border-border bg-background px-5 py-3 text-center font-serif text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm tracking-widest uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "unlocking…" : "Unlock"}
          </button>
          {error && (
            <p className="font-serif text-sm text-destructive">That password doesn’t match.</p>
          )}
        </form>
      </div>
    </main>
  );
}
