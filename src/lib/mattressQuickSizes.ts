import type { Product } from './types';

export type MattressQuickSize = { width: number; length: number };

const MAX_PILLS = 24;

/**
 * Unique width×length pairs from mattress product variants, ordered by how often they appear
 * (most common first), then by dimensions.
 */
export function getMattressQuickSizesFromProducts(products: Product[]): MattressQuickSize[] {
  const map = new Map<string, { width: number; length: number; count: number }>();

  for (const p of products) {
    if (p.category !== 'mattresses') continue;
    for (const v of p.variants ?? []) {
      const w = v.width_cm;
      const l = v.length_cm;
      if (w == null || l == null || !Number.isFinite(w) || !Number.isFinite(l) || w <= 0 || l <= 0) {
        continue;
      }
      const width = Math.round(w);
      const length = Math.round(l);
      const key = `${width}-${length}`;
      const prev = map.get(key);
      if (prev) prev.count += 1;
      else map.set(key, { width, length, count: 1 });
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.width !== a.width) return b.width - a.width;
    return b.length - a.length;
  });

  return sorted.slice(0, MAX_PILLS).map(({ width, length }) => ({ width, length }));
}

export function formatMattressQuickSizeLabel(width: number, length: number): string {
  return `Матрас ${width}×${length}`;
}
