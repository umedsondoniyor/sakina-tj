// src/lib/api.ts
import { supabase } from './supabaseClient';
import type {
  Product,
  ProductVariant,
  Category,
  CustomerReview,
  CarouselSlide,
  QuizStep,
  NavigationItem,
} from './types';

// Lightweight retry with exponential backoff
async function retryOperation<T>(
  op: () => Promise<T>,
  retries = 3,
  initialDelay = 600,
  context = ''
): Promise<T> {
  let lastErr: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const res = await op();
      if (attempt > 1) console.info(`[api] ${context} succeeded on attempt ${attempt}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt > retries) break;
      console.warn(`[api] ${context} failed (attempt ${attempt}/${retries + 1}). Retrying in ${delay}ms…`, err);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw lastErr instanceof Error
    ? new Error(`[api] ${context} failed: ${lastErr.message}`)
    : new Error(`[api] ${context} failed`);
}

/* ------------------- Carousel ------------------- */
export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('carousel_slides')
      .select('*')
      .eq('active', true)
      .order('order', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }, 3, 600, 'getCarouselSlides');
}

/* ------------------- Products ------------------- */
// NOTE: pulls variants; if payload is too big, create a slimmer variant (e.g. getProductsLite)
export async function getProducts(): Promise<Product[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Normalize to .variants for legacy callers if needed
    const normalized = (data ?? []).map((p: any) => ({
      ...p,
      variants: p.product_variants ?? p.variants ?? [],
    })) as Product[];
    return normalized;
  }, 3, 600, 'getProducts');
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        inventory:inventory(
          stock_quantity,
          in_stock,
          location_id,
          locations:locations(name, is_active)
        )
      `)
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // flatten first inventory record
    return (data ?? []).map((v: any) => {
      const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
      return {
        ...v,
        inventory: inv
          ? {
              stock_quantity: inv.stock_quantity,
              in_stock: inv.in_stock,
              location_id: inv.location_id,
            }
          : undefined,
      } as ProductVariant & { inventory?: { stock_quantity?: number; in_stock?: boolean; location_id?: string } };
    });
  }, 3, 600, `getProductVariants:${productId}`);
}

export async function getVariantsByType(sizeType: string): Promise<ProductVariant[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        inventory:inventory(
          stock_quantity,
          in_stock,
          location_id,
          locations:locations(name, is_active)
        )
      `)
      .eq('size_type', sizeType)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((v: any) => {
      const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
      return {
        ...v,
        inventory: inv
          ? {
              stock_quantity: inv.stock_quantity,
              in_stock: inv.in_stock,
              location_id: inv.location_id,
            }
          : undefined,
      } as ProductVariant;
    });
  }, 3, 600, `getVariantsByType:${sizeType}`);
}

/* ------------------- Best sellers & categories ------------------- */
export async function getBestSellers(): Promise<Product[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('review_count', { ascending: false })
      .limit(4);

    if (error) throw error;
    return data ?? [];
  }, 3, 600, 'getBestSellers');
}

export async function getCategories(): Promise<Category[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }, 3, 600, 'getCategories');
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants:product_variants(*)
      `)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((p: any) => ({
      ...p,
      variants: p.product_variants ?? p.variants ?? [],
    })) as Product[];
  }, 3, 600, `getProductsByCategory:${category}`);
}

/* ------------------- Reviews ------------------- */
export async function getCustomerReviews(): Promise<CustomerReview[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('active', true)
      .order('order', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }, 3, 600, 'getCustomerReviews');
}

/* ------------------- Auth helpers ------------------- */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!data.session;
  } catch {
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user ?? null;
  } catch {
    return null;
  }
}

/* ------------------- Quiz / Navigation ------------------- */
export async function getQuizSteps(): Promise<QuizStep[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('quiz_steps')
      .select(`
        *,
        options:quiz_step_options(*)
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((step: any) => ({
      ...step,
      options: (step.options ?? [])
        .filter((o: any) => o.is_active)
        .sort((a: any, b: any) => a.order_index - b.order_index),
    })) as QuizStep[];
  }, 3, 600, 'getQuizSteps');
}

export async function getNavigationItems(): Promise<NavigationItem[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }, 3, 600, 'getNavigationItems');
}
