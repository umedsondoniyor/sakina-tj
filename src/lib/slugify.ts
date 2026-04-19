import { PRODUCT_ID_UUID_RE } from './productUrl';

/** Basic Cyrillic → Latin map for URL slugs (product names in Russian). */
const CYR_TO_LAT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

/**
 * Build a URL-safe slug from a product name (Latin + digits + hyphens).
 * Falls back to "tovar" if nothing usable remains.
 */
export function slugifyProductName(name: string): string {
  const lower = name.toLowerCase().trim();
  let out = '';
  for (const ch of lower) {
    if (CYR_TO_LAT[ch]) {
      out += CYR_TO_LAT[ch];
      continue;
    }
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      continue;
    }
    if (/\s|[-_/]/.test(ch) || /[.,;:!?'"()«»—–]/.test(ch)) {
      if (out && !out.endsWith('-')) out += '-';
    }
  }
  const cleaned = out.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
  return cleaned || 'tovar';
}

/** Validate optional slug (Latin, digits, hyphens). Must not look like a UUID. */
export function isValidProductSlug(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  if (PRODUCT_ID_UUID_RE.test(t)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(t);
}
