import type { Product } from './types';

/** Match standard UUID (product id in URLs). */
export const PRODUCT_ID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public path for a product: prefer slug when set, otherwise fall back to id (legacy links).
 */
export function getProductPath(product: Pick<Product, 'id' | 'slug'>): string {
  const s = product.slug?.trim();
  if (s) return `/products/${encodeURIComponent(s)}`;
  return `/products/${product.id}`;
}
