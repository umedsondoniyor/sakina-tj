const DEFAULT_SITE_URL = 'https://sakina.tj';

/** Used when DB rows are missing or empty (matches previous hardcoded HomePage SEO). */
export const HOME_SEO_FALLBACK = {
  title: 'Матрасы и товары для сна в Душанбе',
  description:
    'Матрасы, кровати, подушки и товары для сна в Душанбе с доставкой и гарантией.',
} as const;

export type SeoPageRow = {
  route_key: string;
  meta_title: string;
  meta_description: string | null;
};

/**
 * Resolve `<title>` and meta description for `/` using `home` → `default` → {@link HOME_SEO_FALLBACK}.
 */
export function resolveHomeSeo(rows: SeoPageRow[]): { title: string; description: string } {
  const map = new Map(rows.map((r) => [r.route_key, r]));
  const home = map.get('home');
  const def = map.get('default');
  const title =
    home?.meta_title?.trim() || def?.meta_title?.trim() || HOME_SEO_FALLBACK.title;
  const description =
    home?.meta_description?.trim() ||
    def?.meta_description?.trim() ||
    HOME_SEO_FALLBACK.description;
  return { title, description };
}

export function getSiteUrl() {
  return (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function toAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
