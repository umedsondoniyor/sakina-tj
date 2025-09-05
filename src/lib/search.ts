// src/lib/search.ts
import { supabase } from './supabaseClient';

export type FilterState = {
  age: string[];
  hardness: string[];
  width: number[];     // [min,max] or []
  length: number[];    // [min,max] or []
  height: number[];    // [min,max] or []
  price: number[];     // [min,max] or []
  inStock: boolean;
  productType: string[];
  mattressType: string[];
  preferences: string[];
  functions: string[];
  weightCategory: string[];
};

const minOf = (r?: number[]) =>
  r && r.length && r[0] !== undefined && r[0] !== null ? r[0] : undefined;
const maxOf = (r?: number[]) =>
  r && r.length && r[1] !== undefined && r[1] !== null ? r[1] : undefined;

export async function fetchFilteredVariants(
  filters: FilterState,
  selectedCategories: string[]
) {
  // Build base query from product_variants so we can filter by dimensions easily.
  // Embed parent product (products!inner(...)) so we can also filter on product fields.
  let q = supabase
    .from('product_variants')
    .select(
      `
      id, product_id, size_name, size_type,
      height_cm, width_cm, length_cm,
      price, old_price, display_order,
      products:products!inner(
        id, name, category, image_urls, image_url,
        price, old_price, sale_percentage,
        rating, review_count, weight_category,
        hardness, warranty_years, mattress_type
      ),
      inventory:inventory(in_stock, stock_quantity)
    `
    );

  // Category (product field)
  if (selectedCategories.length) {
    q = q.in('products.category', selectedCategories);
  }

  // Hardness (product field)
  if (filters.hardness.length) {
    q = q.in('products.hardness', filters.hardness);
  }

  // Weight category (product field)
  if (filters.weightCategory.length) {
    q = q.in('products.weight_category', filters.weightCategory);
  }

  // In stock flag (inventory child)
  if (filters.inStock) {
    // Require an inventory row with in_stock = true.
    // Using `inventory.in_stock=eq.true` is not supported in filters,
    // so we filter after fetch OR with a Postgres view if you prefer.
    // Here we filter after fetch; it's simple and fast enough for small catalogs.
  }

  // Range filters on variant columns
  const wMin = minOf(filters.width);
  const wMax = maxOf(filters.width);
  if (wMin !== undefined) q = q.gte('width_cm', wMin);
  if (wMax !== undefined) q = q.lte('width_cm', wMax);

  const lMin = minOf(filters.length);
  const lMax = maxOf(filters.length);
  if (lMin !== undefined) q = q.gte('length_cm', lMin);
  if (lMax !== undefined) q = q.lte('length_cm', lMax);

  const hMin = minOf(filters.height);
  const hMax = maxOf(filters.height);
  if (hMin !== undefined) q = q.gte('height_cm', hMin);
  if (hMax !== undefined) q = q.lte('height_cm', hMax);

  const pMin = minOf(filters.price);
  const pMax = maxOf(filters.price);
  if (pMin !== undefined) q = q.gte('price', pMin);
  if (pMax !== undefined) q = q.lte('price', pMax);

  // Order by product display/variant ordering (tweak as you like)
  q = q.order('display_order', { ascending: true }).order('price', { ascending: true });

  const { data, error } = await q;
  if (error) throw error;

  // Optional post-filter for "only in stock"
  const rows = (data ?? []).filter((r: any) =>
    filters.inStock ? r.inventory?.[0]?.in_stock === true : true
  );

  return rows as Array<{
    id: string;
    product_id: string;
    size_name: string;
    size_type: string;
    height_cm: number | null;
    width_cm: number | null;
    length_cm: number | null;
    price: number;
    old_price: number | null;
    display_order: number | null;
    products: {
      id: string;
      name: string;
      category: string;
      image_urls: string[] | null;
      image_url: string | null;
      price: number;
      old_price: number | null;
      sale_percentage: number | null;
      rating: number | null;
      review_count: number | null;
      weight_category: string | null;
      hardness: string | null;
      warranty_years: number | null;
      mattress_type: string | null;
    };
    inventory?: { in_stock: boolean; stock_quantity: number | null }[];
  }>;
}
