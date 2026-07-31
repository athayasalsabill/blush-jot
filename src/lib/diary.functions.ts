import { createServerFn } from "@tanstack/react-start";
import { getGateSession, passwordMatches, requireUnlocked } from "./gate.server";
import { getEntry, listEntries, saveEntry } from "./github.server";

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) throw new Error("SITE_PASSWORD is not set");
    if (!passwordMatches(data.password, expected)) return { ok: false as const };
    const session = await getGateSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockSite = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getGateSession();
  await session.clear();
  return { ok: true as const };
});

export const isUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getGateSession();
  return { unlocked: Boolean(session.data.unlocked) };
});

export const fetchEntries = createServerFn({ method: "GET" })
  .inputValidator((data: { folder: string }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    return { entries: await listEntries(data.folder) };
  });

export const fetchEntry = createServerFn({ method: "GET" })
  .inputValidator((data: { folder: string; slug: string }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    return { entry: await getEntry(data.folder, data.slug) };
  });

export const persistEntry = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { folder: string; slug: string; title: string; date: string; body: string }) => data,
  )
  .handler(async ({ data }) => {
    await requireUnlocked();
    return saveEntry(data);
  });
