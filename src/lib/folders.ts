export const FOLDERS = [
  { slug: "2024-diari", label: "2024 Diari", tone: "blush" },
  { slug: "refleksi-bulanan", label: "Refleksi Bulanan", tone: "rose" },
  { slug: "draf", label: "Draf", tone: "sky" },
] as const;

export type FolderSlug = (typeof FOLDERS)[number]["slug"];

export function folderLabel(slug: string) {
  return FOLDERS.find((f) => f.slug === slug)?.label ?? slug;
}

export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base || "entri";
}
