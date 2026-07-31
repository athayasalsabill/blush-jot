import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { isUnlocked, lockSite } from "@/lib/diary.functions";
import { FOLDERS } from "@/lib/folders";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/folders")({
  beforeLoad: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Map Diari — Blush Diary" },
      { name: "description", content: "Pembatas map untuk mengatur catatan diari kamu." },
      { property: "og:title", content: "Map Diari — Blush Diary" },
      { property: "og:description", content: "Pembatas map untuk mengatur catatan diari kamu." },
    ],
  }),
  component: Folders,
});

const tabTone: Record<string, string> = {
  blush: "bg-secondary",
  rose: "bg-accent",
  sky: "bg-muted",
};

function Folders() {
  const router = useRouter();
  const lock = useServerFn(lockSite);

  return (
    <main className="min-h-screen bg-background px-5 pt-14 pb-20">
      <header className="mx-auto flex w-full max-w-md items-baseline justify-between">
        <h1 className="font-serif text-3xl text-foreground">Blush Diary</h1>
        <button
          onClick={async () => {
            await lock();
            await router.navigate({ to: "/" });
          }}
          className="text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-primary"
        >
          Kunci
        </button>
      </header>

      <p className="mx-auto mt-2 w-full max-w-md font-serif text-sm italic text-muted-foreground">
        Pilih pembatas map untuk mulai membaca.
      </p>

      <div className="mx-auto mt-10 w-full max-w-md">
        {FOLDERS.map((folder, i) => (
          <Link
            key={folder.slug}
            to="/folders/$folder"
            params={{ folder: folder.slug }}
            className="fade-up block"
            style={{ animationDelay: `${i * 70}ms`, marginTop: i === 0 ? 0 : "-14px" }}
          >
            <div className="relative">
              <div
                className={`${tabTone[folder.tone]} paper-shadow ml-auto w-40 rounded-t-xl px-4 py-2 font-serif text-sm text-foreground`}
                style={{ marginRight: `${i * 2.75}rem` }}
              >
                {folder.label}
              </div>
              <div
                className={`${tabTone[folder.tone]} paper-shadow h-28 rounded-xl rounded-tr-none transition-transform duration-300 hover:-translate-y-1`}
              >
                <span className="block px-5 pt-5 font-serif text-xs tracking-wide text-muted-foreground">
                  buka map
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
