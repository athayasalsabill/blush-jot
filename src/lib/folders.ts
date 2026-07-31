export type FolderTheme =
  | "blush"
  | "rose"
  | "sage"
  | "sky"
  | "butter"
  | "lilac"
  | "dots"
  | "stripes"
  | "plaid";

export type Folder = { slug: string; label: string; theme: FolderTheme };

export const THEMES: { id: FolderTheme; label: string; tab: string; page: string }[] = [
  { id: "blush", label: "Blush", tab: "bg-secondary", page: "bg-secondary/40" },
  { id: "rose", label: "Rose", tab: "bg-accent", page: "bg-accent/50" },
  { id: "sage", label: "Sage", tab: "bg-sage", page: "bg-sage/45" },
  { id: "sky", label: "Sky", tab: "bg-sky-pastel", page: "bg-sky-pastel/45" },
  { id: "butter", label: "Butter", tab: "bg-butter", page: "bg-butter/50" },
  { id: "lilac", label: "Lilac", tab: "bg-lilac", page: "bg-lilac/50" },
  { id: "dots", label: "Titik", tab: "texture-dots", page: "texture-dots" },
  { id: "stripes", label: "Garis", tab: "texture-stripes", page: "texture-stripes" },
  { id: "plaid", label: "Kotak", tab: "texture-plaid", page: "texture-plaid" },
];

export const THEME_IDS = THEMES.map((t) => t.id);

export function themeTab(theme: string) {
  return THEMES.find((t) => t.id === theme)?.tab ?? "bg-secondary";
}

export function themePage(theme: string) {
  return THEMES.find((t) => t.id === theme)?.page ?? "bg-card";
}

export const DEFAULT_FOLDERS: Folder[] = [
  { slug: "2024-diari", label: "2024 Diari", theme: "blush" },
  { slug: "refleksi-bulanan", label: "Refleksi Bulanan", theme: "plaid" },
  { slug: "draf", label: "Draf", theme: "sky" },
];

export function prettifySlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
