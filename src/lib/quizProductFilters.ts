/**
 * Maps quiz step selections (step_key → option_value) to ProductsPage filter state.
 * Admin-configured step_key values should match the cases below, or use option_value
 * shaped like WIDTH_HEIGHT (e.g. 160_200) for size steps.
 */

export function mapHardnessQuizValueToProduct(raw: string): string {
  const v = raw.trim();
  const hardnessMap: Record<string, string> = {
    soft: 'Мягкая',
    middle: 'Средняя',
    hard: 'Жесткая',
  };
  return hardnessMap[v] ?? v;
}

/** Parses common mattress/bed size encodings from quiz option_value. */
export function parseSizeOptionValue(raw: string): { width: number; length: number } | null {
  const s = raw.trim();
  if (!s) return null;
  const normalized = s.replace(/[×х]/gi, 'x').replace(/\s+/g, '');
  const byUnderscore = normalized.split('_').filter(Boolean);
  if (byUnderscore.length >= 2) {
    const w = parseInt(byUnderscore[0], 10);
    const l = parseInt(byUnderscore[1], 10);
    if (Number.isFinite(w) && Number.isFinite(l)) return { width: w, length: l };
  }
  const xMatch = normalized.match(/^(\d+)\s*x\s*(\d+)$/i);
  if (xMatch) {
    const w = parseInt(xMatch[1], 10);
    const l = parseInt(xMatch[2], 10);
    if (Number.isFinite(w) && Number.isFinite(l)) return { width: w, length: l };
  }
  return null;
}

export interface QuizProductFiltersPayload {
  age: string[];
  hardness: string[];
  width: number[];
  length: number[];
  height: number[];
  price: number[];
  inStock: boolean;
  productType: string[];
  mattressType: string[];
  preferences: string[];
  functions: string[];
  weightCategory: string[];
}

export function mapQuizSelectionsToProductFilters(
  selections: Record<string, string>,
  productKind: 'mattress' | 'bed',
): QuizProductFiltersPayload {
  const productType = productKind === 'bed' ? ['beds'] : ['mattresses'];

  const out: QuizProductFiltersPayload = {
    age: [],
    hardness: [],
    width: [],
    length: [],
    height: [],
    price: [],
    inStock: false,
    productType,
    mattressType: [],
    preferences: [],
    functions: [],
    weightCategory: [],
  };

  const tryApplySize = (value: string) => {
    const sz = parseSizeOptionValue(value);
    if (sz) {
      out.width = [sz.width, sz.width];
      out.length = [sz.length, sz.length];
    }
  };

  for (const [stepKey, raw] of Object.entries(selections)) {
    if (raw == null || String(raw).trim() === '') continue;
    const v = String(raw).trim();

    const key = stepKey.trim();

    // Size steps (common admin keys + generic names)
    if (
      key === 'self_size' ||
      key === 'bed_size' ||
      key === 'size' ||
      /(^|_)(size|dimensions|width)(_|$)/i.test(key)
    ) {
      tryApplySize(v);
      continue;
    }

    switch (key) {
      case 'hardness':
        out.hardness = [mapHardnessQuizValueToProduct(v)];
        break;
      case 'age':
        out.age = [v];
        break;
      case 'mattress_type':
      case 'mattressType':
        out.mattressType = [v];
        break;
      case 'weight_category':
      case 'weightCategory':
        out.weightCategory = [v];
        break;
      case 'preferences':
        out.preferences = [v];
        break;
      case 'functions':
        out.functions = [v];
        break;
      case 'height':
      case 'height_cm': {
        const h = parseInt(v, 10);
        if (Number.isFinite(h)) out.height = [h, h];
        break;
      }
      default:
        // If option looks like a size but step_key is custom, still try to parse
        if (/[_×хx]|\d+\s*x\s*\d+/i.test(v)) {
          tryApplySize(v);
        }
    }
  }

  return out;
}
