// lib/facets.ts
export type FacetKey =
  | 'price' | 'inStock' | 'hardness' | 'mattressType' | 'weightCategory'
  | 'width' | 'length' | 'height'
  | 'pillowHeight' | 'sizeName' | 'material' | 'functions';

export const CATEGORY_FACETS: Record<string, FacetKey[]> = {
  // base “always useful”
  _base: ['price', 'inStock'],

  mattresses: [
    'hardness', 'mattressType', 'weightCategory', 'width', 'length', 'height',
  ],
  pillows: [
    'sizeName', 'pillowHeight', 'price', 'inStock',
  ],
  beds: [
    'width', 'length', 'price', 'inStock',
  ],
  smartchair: [
    'functions', 'price', 'inStock',
  ],
  blankets: [
    'sizeName', 'price', 'inStock',
  ],
  furniture: [
    'material', 'price', 'inStock',
  ],
  map: [
    'price', 'inStock',
  ],
};

// Helper: gather facets for N selected categories
export function facetsForCategories(selected: string[]) {
  const set = new Set<FacetKey>(CATEGORY_FACETS._base as FacetKey[]);
  if (selected.length === 0) return [...set];
  selected.forEach(c => CATEGORY_FACETS[c]?.forEach(f => set.add(f)));
  return [...set];
}
