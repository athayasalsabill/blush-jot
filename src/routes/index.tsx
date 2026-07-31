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
      { title: "Blush Diary — Diari teks pribadi" },
      {
        name: "description",
        content:
          "Diari teks minimalis berwarna pink pastel. Masuk dengan kata sandi untuk membaca dan menulis catatan pribadi.",
      },
      { property: "og:title", content: "Blush Diary — Diari teks pribadi" },
      {
        property: "og:description",
        content: "Diari teks minimalis berwarna pink pastel, tersimpan aman di GitHub pribadi.",
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
    <main className="texture-stripes flex min-h-screen items-center justify-center px-6">
      <div className="paper-shadow fade-up w-full max-w-sm rounded-2xl bg-card px-7 py-12 text-center">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Blush Diary</h1>
        <p className="mt-2 font-serif text-sm italic text-muted-foreground">
          hanya untuk matamu sendiri
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="kata sandi"
            className="w-full rounded-full border border-border bg-background px-5 py-3 text-center font-serif text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm tracking-widest uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "membuka…" : "Buka"}
          </button>
          {error && (
            <p className="font-serif text-sm text-destructive">Kata sandi tidak sesuai.</p>
          )}
        </form>
      </div>
    </main>
  );
}
