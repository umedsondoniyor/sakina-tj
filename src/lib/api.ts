import { supabase } from './supabaseClient';
import type { Product, Category, CustomerReview, CarouselSlide } from './types';
import toast from 'react-hot-toast';

// Enhanced utility function for retrying failed requests
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  initialDelay = 1000,
  context = ''
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        console.log(`Successfully completed ${context} after ${attempt} attempts`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      
      console.error(`Attempt ${attempt}/${retries + 1} failed for ${context}:`, {
        message: lastError.message,
        stack: lastError.stack,
        context,
        attempt
      });

      if (attempt <= retries) {
        console.warn(
          `Retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  const errorMessage = `Operation failed after ${retries + 1} attempts: ${lastError?.message}`;
  console.error(`All retry attempts failed for ${context}:`, {
    error: lastError,
    context,
    totalAttempts: retries + 1
  });
  
  throw new Error(errorMessage);
}

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('carousel_slides')
      .select('*')
      .eq('active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching carousel slides:', error);
      toast.error('Failed to load carousel slides');
      throw error;
    }

    return data || [];
  }, 3, 1000, 'getCarouselSlides');
}

export async function getProducts(): Promise<Product[]> {
  return retryOperation(async () => {
    // First check if we have a valid session and connection
    const { error: healthCheckError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
      .single();

    if (healthCheckError) {
      console.error('Database health check failed:', healthCheckError);
      throw new Error('Database connection error');
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products. Please try again.');
      throw error;
    }

    if (!data) {
      console.log('No products found in the database');
      return [];
    }

    return data;
  }, 3, 1000, 'getProducts');
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        inventory!inner(
          stock_quantity,
          in_stock,
          location_id,
          locations!inner(name, is_active)
        )
      `)
      .eq('product_id', productId)
      .eq('inventory.locations.is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }

    // Transform data to include inventory information
    const transformedData = (data || []).map(variant => ({
      ...variant,
      inventory: variant.inventory?.[0] ? {
        stock_quantity: variant.inventory[0].stock_quantity,
        in_stock: variant.inventory[0].in_stock,
        location_id: variant.inventory[0].location_id
      } : undefined
    }));

    return transformedData;
  }, 3, 1000, `getProductVariants:${productId}`);
}

export async function getVariantsByType(sizeType: string): Promise<ProductVariant[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        inventory!inner(
          stock_quantity,
          in_stock,
          location_id,
          locations!inner(name, is_active)
        )
      `)
      .eq('size_type', sizeType)
      .eq('inventory.in_stock', true)
      .eq('inventory.locations.is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching variants by type:', error);
      throw error;
    }

    // Transform data to include inventory information
    const transformedData = (data || []).map(variant => ({
      ...variant,
      inventory: variant.inventory?.[0] ? {
        stock_quantity: variant.inventory[0].stock_quantity,
        in_stock: variant.inventory[0].in_stock,
        location_id: variant.inventory[0].location_id
      } : undefined
    }));

    return transformedData;
  }, 3, 1000, `getVariantsByType:${sizeType}`);
}

export async function getDefaultLocation() {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching default location:', error);
      throw error;
    }

    return data;
  }, 3, 1000, 'getDefaultLocation');
}

export async function getBestSellers(): Promise<Product[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('review_count', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching best sellers:', error);
      toast.error('Failed to load best sellers. Please try again.');
      throw error;
    }

    if (!data) {
      console.log('No best sellers found in the database');
      return [];
    }

    return data;
  }, 3, 1000, 'getBestSellers');
}

export async function getCategories(): Promise<Category[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories. Please try again.');
      throw error;
    }

    return data || [];
  }, 3, 1000, 'getCategories');
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      toast.error('Failed to load products for this category. Please try again.');
      throw error;
    }

    if (!data) {
      console.log(`No products found in category: ${category}`);
      return [];
    }

    return data;
  }, 3, 1000, `getProductsByCategory:${category}`);
}

export async function getCustomerReviews(): Promise<CustomerReview[]> {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching customer reviews:', error);
      toast.error('Failed to load customer reviews. Please try again.');
      throw error;
    }

    if (!data) {
      console.log('No customer reviews found');
      return [];
    }

    return data;
  }, 3, 1000, 'getCustomerReviews');
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking authentication:', error);
      throw error;
    }
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}