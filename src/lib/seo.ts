import type { SeoExtraMetaTag } from './types';

export function pickOgImageFromExtraMeta(extraMeta: SeoExtraMetaTag[]): string | undefined {
  const tag = extraMeta.find((t) => t.property === 'og:image' && t.content?.trim());
  return tag?.content.trim();
}

/** Absolute URL for sharing; relative paths are resolved against site base. */
export function resolveAbsoluteOgImageUrl(candidate: string | undefined, siteBase: string): string {
  const base = siteBase.replace(/\/$/, '');
  const fallback = `${base}/og/cover-1200x630.jpg`;
  if (!candidate?.trim()) return fallback;
  const c = candidate.trim();
  if (c.startsWith('http://') || c.startsWith('https://')) return c;
  return c.startsWith('/') ? `${base}${c}` : `${base}/${c}`;
}

const DEFAULT_SITE_URL = 'https://sakina.tj';

/** Used when DB rows are missing or empty (matches previous hardcoded HomePage SEO). */
export const HOME_SEO_FALLBACK = {
  title: 'Матрасы и товары для сна в Душанбе',
  description:
    'Матрасы, кровати, подушки и товары для сна в Душанбе с доставкой и гарантией.',
  keywords:
    'матрасы, кровати, подушки, одеяла, Sakina, ортопедический матрас, Таджикистан',
} as const;

export type SeoPageRow = {
  route_key: string;
  meta_title: string;
  meta_description: string | null;
  meta_keywords?: string | null;
  extra_meta?: SeoExtraMetaTag[] | null;
};

function normalizeExtraMeta(raw: unknown): SeoExtraMetaTag[] {
  if (!Array.isArray(raw)) return [];
  const out: SeoExtraMetaTag[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const content = typeof o.content === 'string' ? o.content.trim() : '';
    if (!content) continue;
    const name = typeof o.name === 'string' ? o.name.trim() : undefined;
    const property = typeof o.property === 'string' ? o.property.trim() : undefined;
    if (!name && !property) continue;
    out.push({ ...(name ? { name } : {}), ...(property ? { property } : {}), content });
  }
  return out;
}

export function parseExtraMetaJson(input: string): { ok: true; value: SeoExtraMetaTag[] } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, value: [] };
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) return { ok: false, error: 'Ожидается JSON-массив' };
    const value = normalizeExtraMeta(parsed);
    return { ok: true, value };
  } catch {
    return { ok: false, error: 'Неверный JSON' };
  }
}

export function formatExtraMetaForEditor(tags: SeoExtraMetaTag[] | null | undefined): string {
  if (!tags?.length) return '';
  return JSON.stringify(tags, null, 2);
}

function pickExtraMeta(home?: SeoPageRow, def?: SeoPageRow): SeoExtraMetaTag[] {
  const homeTags = normalizeExtraMeta(home?.extra_meta);
  if (homeTags.length > 0) return homeTags;
  return normalizeExtraMeta(def?.extra_meta);
}

/**
 * Resolve `<title>`, meta description, keywords, and extra meta for `/` using `home` → `default` → {@link HOME_SEO_FALLBACK}.
 */
export function resolveHomeSeo(rows: SeoPageRow[]): {
  title: string;
  description: string;
  keywords: string;
  extraMeta: SeoExtraMetaTag[];
} {
  const map = new Map(rows.map((r) => [r.route_key, r]));
  const home = map.get('home');
  const def = map.get('default');
  const title =
    home?.meta_title?.trim() || def?.meta_title?.trim() || HOME_SEO_FALLBACK.title;
  const description =
    home?.meta_description?.trim() ||
    def?.meta_description?.trim() ||
    HOME_SEO_FALLBACK.description;
  const keywords =
    home?.meta_keywords?.trim() ||
    def?.meta_keywords?.trim() ||
    HOME_SEO_FALLBACK.keywords;
  const extraMeta = pickExtraMeta(home, def);
  return { title, description, keywords, extraMeta };
}

export function getSiteUrl() {
  return (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function toAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
