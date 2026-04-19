// src/lib/api.ts
import { supabase } from './supabaseClient';
import { getBlogPosts } from './blogApi';
import type {
  Product,
  ProductVariant,
  Category,
  CustomerReview,
  CarouselSlide,
  QuizStep,
  NavigationItem,
  RelatedProduct,
  FaqItem,
  PrivacyPolicySettings,
  FooterPayload,
  FooterSiteSettings,
  FooterColumn,
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

export async function getProductById(id: string): Promise<Product | null> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants:product_variants(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      variants: data.product_variants ?? data.variants ?? [],
    } as Product;
  }, 3, 600, `getProductById:${id}`);
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

export async function getAllCategorySlugs(): Promise<string[]> {
  return retryOperation(async () => {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug');

    if (categoriesError) throw categoriesError;

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('category');

    if (productsError) throw productsError;

    const slugs = new Set<string>();
    (categories ?? []).forEach((category: any) => {
      if (category?.slug) slugs.add(category.slug);
    });
    (products ?? []).forEach((product: any) => {
      if (product?.category) slugs.add(product.category);
    });

    return Array.from(slugs);
  }, 3, 600, 'getAllCategorySlugs');
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

export async function getAllProductIds(): Promise<string[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id');

    if (error) throw error;
    return (data ?? []).map((row: any) => row.id).filter(Boolean);
  }, 3, 600, 'getAllProductIds');
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

export async function getQuizPickerVisibility(): Promise<{ mattress: boolean; bed: boolean }> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('quiz_picker_visibility')
      .select('product_type, is_visible');

    if (error) throw error;

    const mattress =
      data?.find((r) => r.product_type === 'mattress')?.is_visible ?? true;
    const bed = data?.find((r) => r.product_type === 'bed')?.is_visible ?? true;

    return { mattress, bed };
  }, 3, 600, 'getQuizPickerVisibility');
}

export async function getPrivacyPolicySettings(): Promise<PrivacyPolicySettings | null> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('privacy_policy_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as PrivacyPolicySettings | null;
  }, 3, 600, 'getPrivacyPolicySettings');
}

export async function getFaqItems(): Promise<FaqItem[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data ?? []) as FaqItem[];
  }, 3, 600, 'getFaqItems');
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

export async function getDeliveryPaymentSettings(): Promise<{
  id: string;
  title: string;
  description: string | null;
  delivery_content: string | null;
  payment_content: string | null;
} | null> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('delivery_payment_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  }, 3, 600, 'getDeliveryPaymentSettings');
}

const FOOTER_RU_CATEGORY_NAMES: Record<string, string> = {
  mattresses: 'Матрасы',
  beds: 'Кровати',
  pillows: 'Подушки',
  blankets: 'Одеяла',
  sofas: 'Диваны и кресла',
  covers: 'Чехлы',
  kids: 'Для детей',
  furniture: 'Мебель',
  smartchair: 'Массажные кресла',
  map: 'Карты',
};

/** Default contact/footer row — used before DB load and as merge base */
export const FOOTER_SITE_SETTINGS_DEFAULTS: FooterSiteSettings = {
  id: 'default',
  phone_display: '+992 90 533 95 95',
  phone_href: 'tel:+992905339595',
  email: 'info@sakina.tj',
  email_href: 'mailto:info@sakina.tj',
  address: 'Душанбе, Пулоди 4',
  copyright_line1: '© {year} Компания «Sakina»',
  copyright_line2: 'Все права защищены',
  legal_text: 'ИП "Sakina"\nИНН: указать при наличии',
  payment_label: 'Принимаем к оплате:',
  show_payment_icons: true,
  social_heading: 'Следите за новостями',
  instagram_url:
    'https://www.instagram.com/sakina.tj?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  created_at: '',
  updated_at: '',
};

async function buildFooterCategoryColumnLinks(): Promise<{ label: string; href: string }[]> {
  const cats = await getCategories().catch(() => [] as Category[]);
  const { data: products } = await supabase.from('products').select('category');
  const categorySet = new Set<string>();
  (products || []).forEach((p: { category?: string }) => {
    if (p.category) categorySet.add(p.category);
  });

  const allCategories: { id: string; name: string; slug: string }[] = [];

  cats.forEach((cat: Category) => {
    const slug = cat.slug || '';
    if (slug) {
      allCategories.push({
        id: cat.id,
        name: cat.name || FOOTER_RU_CATEGORY_NAMES[slug] || slug,
        slug,
      });
    }
  });

  categorySet.forEach((slug) => {
    if (!allCategories.find((c) => c.slug === slug)) {
      allCategories.push({
        id: slug,
        name: FOOTER_RU_CATEGORY_NAMES[slug] || slug,
        slug,
      });
    }
  });

  const mainCategories = ['mattresses', 'beds', 'pillows', 'blankets', 'sofas', 'smartchair'];
  const sorted = allCategories
    .filter((c) => mainCategories.includes(c.slug) || categorySet.has(c.slug))
    .sort((a, b) => {
      const aIndex = mainCategories.indexOf(a.slug);
      const bIndex = mainCategories.indexOf(b.slug);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name.localeCompare(b.name, 'ru');
    })
    .slice(0, 6);

  return sorted.map((cat) => ({
    label: cat.name,
    href: `/categories/${cat.slug}`,
  }));
}

async function buildFooterBlogColumnLinks(): Promise<{ label: string; href: string }[]> {
  const posts = await getBlogPosts({ status: 'published', limit: 6 }).catch(() => []);
  const links: { label: string; href: string }[] = [{ label: 'Все статьи', href: '/blog' }];
  posts.forEach((post) => {
    links.push({ label: post.title, href: `/blog/${post.slug}` });
  });
  return links;
}

function mergeFooterSettings(row: Partial<FooterSiteSettings> | null): FooterSiteSettings {
  if (!row?.id) {
    return { ...FOOTER_SITE_SETTINGS_DEFAULTS };
  }
  return {
    ...FOOTER_SITE_SETTINGS_DEFAULTS,
    ...row,
    copyright_line2: row.copyright_line2 ?? FOOTER_SITE_SETTINGS_DEFAULTS.copyright_line2,
    legal_text: row.legal_text ?? FOOTER_SITE_SETTINGS_DEFAULTS.legal_text,
    instagram_url: row.instagram_url ?? FOOTER_SITE_SETTINGS_DEFAULTS.instagram_url,
  } as FooterSiteSettings;
}

async function fetchFooterSettingsMerged(): Promise<FooterSiteSettings> {
  const { data: settingsRow, error: settingsError } = await supabase
    .from('footer_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (settingsError) throw settingsError;

  return mergeFooterSettings(settingsRow as FooterSiteSettings | null);
}

async function fetchFooterColumnsData(): Promise<FooterColumn[]> {
  const { data: sectionsRaw, error: sectionsError } = await supabase
    .from('footer_sections')
    .select('*, footer_section_links(*)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (sectionsError) throw sectionsError;

  const columns: FooterColumn[] = [];

  for (const section of sectionsRaw ?? []) {
    const slug = section.slug as string;
    const title = section.title as string;
    const sectionType = section.section_type as 'manual' | 'categories' | 'blog';

    if (sectionType === 'categories') {
      columns.push({
        slug,
        title,
        links: await buildFooterCategoryColumnLinks(),
      });
      continue;
    }

    if (sectionType === 'blog') {
      columns.push({
        slug,
        title,
        links: await buildFooterBlogColumnLinks(),
      });
      continue;
    }

    const rawLinks = (section as any).footer_section_links as Array<Record<string, unknown>> | undefined;
    const links = (rawLinks ?? [])
      .filter((l) => l.is_active !== false)
      .sort(
        (a, b) =>
          ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
      )
      .map((l) => ({
        label: String(l.label),
        href: String(l.href),
      }));

    const rawTitleHref = (section as { title_href?: string | null }).title_href;
    const titleHref =
      typeof rawTitleHref === 'string' && rawTitleHref.trim() ? rawTitleHref.trim() : null;

    if (links.length === 0 && titleHref) {
      columns.push({ slug, title, links: [], titleHref });
    } else {
      columns.push({ slug, title, links });
    }
  }

  if (columns.length === 0) {
    return [
      {
        slug: 'fallback',
        title: 'Информация',
        links: [
          { label: 'Доставка и оплата', href: '/delivery-payment' },
          { label: 'Контакты', href: '/contacts' },
        ],
      },
    ];
  }

  return columns;
}

/** Site-wide contact block from `footer_settings` (phone, email, Instagram, address, …). */
export async function getFooterSiteSettings(): Promise<FooterSiteSettings> {
  return retryOperation(fetchFooterSettingsMerged, 3, 800, 'getFooterSiteSettings');
}

/** Footer link columns only (for layout below contact strip). */
export async function getFooterColumns(): Promise<FooterColumn[]> {
  return retryOperation(fetchFooterColumnsData, 3, 800, 'getFooterColumns');
}

export async function getFooterPayload(): Promise<FooterPayload> {
  return retryOperation(async () => {
    const [settings, columns] = await Promise.all([
      fetchFooterSettingsMerged(),
      fetchFooterColumnsData(),
    ]);
    return { settings, columns };
  }, 3, 800, 'getFooterPayload');
}