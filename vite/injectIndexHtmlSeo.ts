import type { Plugin } from 'vite';
import {
  resolveHomeSeo,
  pickOgImageFromExtraMeta,
  resolveAbsoluteOgImageUrl,
  type SeoPageRow,
} from '../src/lib/seo';

/** Same as `getSiteUrl()` but uses env from Vite `loadEnv` (import.meta is unavailable in config bundle). */
function siteBaseFromEnv(env: Record<string, string>): string {
  return (env.VITE_SITE_URL || 'https://sakina.tj').replace(/\/$/, '');
}

/** Safe for `<title>`, `<meta content="…">`, etc. */
function escapeHtmlAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchSeoPageRows(env: Record<string, string>): Promise<SeoPageRow[]> {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/seo_page_settings?select=*`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) {
      console.warn(`[injectIndexHtmlSeo] seo_page_settings HTTP ${res.status}`);
      return [];
    }
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as SeoPageRow[]) : [];
  } catch (e) {
    console.warn('[injectIndexHtmlSeo] fetch failed, using fallbacks:', e);
    return [];
  }
}

/**
 * Injects home SEO into `index.html` from `seo_page_settings` (same resolution as HomePage + resolveHomeSeo).
 * Runs at dev server start and at `vite build` so the HTML shell matches /admin/seo without a separate copy.
 */
export async function injectIndexHtmlSeo(html: string, env: Record<string, string>): Promise<string> {
  const rows = await fetchSeoPageRows(env);
  const { title, description, keywords, extraMeta } = resolveHomeSeo(rows);
  const siteBase = siteBaseFromEnv(env);
  const canonical = `${siteBase}/`;
  const ogImage = resolveAbsoluteOgImageUrl(pickOgImageFromExtraMeta(extraMeta), siteBase);

  const replacements: Record<string, string> = {
    __SEO_TITLE__: escapeHtmlAttr(title),
    __SEO_DESCRIPTION__: escapeHtmlAttr(description),
    __SEO_KEYWORDS__: escapeHtmlAttr(keywords),
    __SEO_CANONICAL__: escapeHtmlAttr(canonical),
    __SEO_OG_IMAGE__: escapeHtmlAttr(ogImage),
    __SITE_BASE__: siteBase,
  };

  let out = html;
  for (const [key, value] of Object.entries(replacements)) {
    out = out.split(key).join(value);
  }
  return out;
}

export function injectIndexHtmlSeoPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'inject-index-html-seo',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        return injectIndexHtmlSeo(html, env);
      },
    },
  };
}
