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
  RelatedProduct,
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
    // First get the variants
    const { data: variantsData, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (variantsError) throw variantsError;
    if (!variantsData || variantsData.length === 0) return [];

    // Get variant IDs
    const variantIds = variantsData.map((v: any) => v.id);

    // Get inventory for these variants - don't filter by in_stock, check stock_quantity instead
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        product_variant_id,
        stock_quantity,
        in_stock,
        location_id
      `)
      .in('product_variant_id', variantIds);

    if (inventoryError) throw inventoryError;

    // Create a map of variant_id to inventory
    const inventoryMap = new Map();
    (inventoryData || []).forEach((inv: any) => {
      // Take the first inventory record for each variant
      if (!inventoryMap.has(inv.product_variant_id)) {
        inventoryMap.set(inv.product_variant_id, {
          stock_quantity: inv.stock_quantity,
          in_stock: inv.in_stock || inv.stock_quantity > 0, // Check stock_quantity as fallback
          location_id: inv.location_id,
        });
      }
    });

    // Combine variants with their inventory
    return variantsData.map((v: any) => ({
      ...v,
      inventory: inventoryMap.get(v.id) || {
        stock_quantity: 0,
        in_stock: false,
        location_id: null,
      },
    })) as ProductVariant[];
  }, 3, 600, `getProductVariants:${productId}`);
}

export async function getVariantsByType(sizeType: string): Promise<ProductVariant[]> {
  return retryOperation(async () => {
    // First get the variants
    const { data: variantsData, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('size_type', sizeType)
      .order('display_order', { ascending: true });

    if (variantsError) throw variantsError;
    if (!variantsData || variantsData.length === 0) return [];

    // Get variant IDs
    const variantIds = variantsData.map((v: any) => v.id);

    // Get inventory for these variants - don't filter by in_stock, check stock_quantity instead
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        product_variant_id,
        stock_quantity,
        in_stock,
        location_id
      `)
      .in('product_variant_id', variantIds);

    if (inventoryError) throw inventoryError;

    // Create a map of variant_id to inventory
    const inventoryMap = new Map();
    (inventoryData || []).forEach((inv: any) => {
      // Take the first inventory record for each variant
      if (!inventoryMap.has(inv.product_variant_id)) {
        inventoryMap.set(inv.product_variant_id, {
          stock_quantity: inv.stock_quantity,
          in_stock: inv.in_stock || inv.stock_quantity > 0, // Check stock_quantity as fallback
          location_id: inv.location_id,
        });
      }
    });

    // Combine variants with their inventory
    return variantsData.map((v: any) => ({
      ...v,
      inventory: inventoryMap.get(v.id) || {
        stock_quantity: 0,
        in_stock: false,
        location_id: null,
      },
    })) as ProductVariant[];
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
export async function getQuizSteps(productType: 'mattress' | 'bed' = 'mattress'): Promise<QuizStep[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('quiz_steps')
      .select(`
        *,
        options:quiz_step_options(*)
      `)
      .eq('is_active', true)
      .eq('product_type', productType)
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

/* ------------------- Related Products ------------------- */
export async function getRelatedProducts(productId: string): Promise<Product[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('related_products')
      .select(`
        *,
        related_product:products!related_product_id(*)
      `)
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Extract and return the related products
    return (data ?? [])
      .map((item: any) => item.related_product)
      .filter((p: any) => p !== null) as Product[];
  }, 3, 600, `getRelatedProducts:${productId}`);
}

export async function getRelatedProductsForAdmin(productId: string): Promise<RelatedProduct[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('related_products')
      .select(`
        *,
        related_product:products!related_product_id(*)
      `)
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((item: any) => ({
      ...item,
      related_product: item.related_product,
    })) as RelatedProduct[];
  }, 3, 600, `getRelatedProductsForAdmin:${productId}`);
}

export async function addRelatedProduct(
  productId: string,
  relatedProductId: string,
  displayOrder: number = 0
): Promise<RelatedProduct> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('related_products')
      .insert({
        product_id: productId,
        related_product_id: relatedProductId,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data as RelatedProduct;
  }, 3, 600, `addRelatedProduct:${productId}`);
}

export async function removeRelatedProduct(relationId: string): Promise<void> {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('related_products')
      .delete()
      .eq('id', relationId);

    if (error) throw error;
  }, 3, 600, `removeRelatedProduct:${relationId}`);
}

export async function updateRelatedProductOrder(
  relationId: string,
  displayOrder: number
): Promise<void> {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('related_products')
      .update({ display_order: displayOrder })
      .eq('id', relationId);

    if (error) throw error;
  }, 3, 600, `updateRelatedProductOrder:${relationId}`);
}