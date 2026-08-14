export type FolderTheme =
  | "blush"
  | "rose"
  | "sage"
  | "sky"
  | "butter"
  | "lilac"
  | "dots"
  | "stripes"
  | "plaid"
  | "denim"
  | "velvet"
  | "linen"
  | "corduroy"
  | "kraft"
  | "polka";

export type Folder = { slug: string; label: string; theme: FolderTheme };

export const THEMES: { id: FolderTheme; label: string; tab: string; page: string }[] = [
  { id: "blush", label: "Blush", tab: "bg-secondary", page: "bg-secondary/40" },
  { id: "rose", label: "Rose", tab: "bg-accent", page: "bg-accent/50" },
  { id: "sage", label: "Sage", tab: "bg-sage", page: "bg-sage/45" },
  { id: "sky", label: "Sky", tab: "bg-sky-pastel", page: "bg-sky-pastel/45" },
  { id: "butter", label: "Butter", tab: "bg-butter", page: "bg-butter/50" },
  { id: "lilac", label: "Lilac", tab: "bg-lilac", page: "bg-lilac/50" },
  { id: "dots", label: "Dots", tab: "texture-dots", page: "texture-dots" },
  { id: "stripes", label: "Stripes", tab: "texture-stripes", page: "texture-stripes" },
  { id: "plaid", label: "Plaid", tab: "texture-plaid", page: "texture-plaid" },
  { id: "denim", label: "Denim", tab: "texture-denim", page: "texture-denim" },
  { id: "velvet", label: "Velvet", tab: "texture-velvet", page: "texture-velvet" },
  { id: "linen", label: "Linen", tab: "texture-linen", page: "texture-linen" },
  { id: "corduroy", label: "Corduroy", tab: "texture-corduroy", page: "texture-corduroy" },
  { id: "kraft", label: "Kraft", tab: "texture-kraft", page: "texture-kraft" },
  { id: "polka", label: "Polka", tab: "texture-polka", page: "texture-polka" },
];

export const THEME_IDS = THEMES.map((t) => t.id);

export function themeTab(theme: string) {
  return THEMES.find((t) => t.id === theme)?.tab ?? "bg-secondary";
}

export function themePage(theme: string) {
  return THEMES.find((t) => t.id === theme)?.page ?? "bg-card";
}

export const DEFAULT_FOLDERS: Folder[] = [
  { slug: "2024-diary", label: "2024 Diary", theme: "blush" },
  { slug: "monthly-reflections", label: "Monthly Reflections", theme: "plaid" },
  { slug: "drafts", label: "Drafts", theme: "denim" },
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
  return base || "entry";
}
