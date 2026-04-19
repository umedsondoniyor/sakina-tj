import type { LoaderFunctionArgs } from 'react-router-dom';
import { getBlogPosts } from '../lib/blogApi';
import {
  getCarouselSlides,
  getCategories,
  getCustomerReviews,
  getDeliveryPaymentSettings,
  getFaqItems,
  getProductById,
  getProducts,
  getProductsByCategory,
} from '../lib/api';
import type { BlogPost, CarouselSlide, CustomerReview, FaqItem, Product } from '../lib/types';

export interface HomePageLoaderData {
  slides: CarouselSlide[];
  reviews: CustomerReview[];
  blogPosts: BlogPost[];
}

export interface ProductsPageLoaderData {
  products: Product[];
  selectedCategories: string[];
  source: 'products' | 'categories';
  landingMeta?: {
    filterType: 'size' | 'material';
    filterSlug: string;
    filterValue: string;
    pageTitle: string;
    seoTitle: string;
    seoDescription: string;
    canonicalPath: string;
  };
}

export interface ProductPageLoaderData {
  product: Product | null;
  similarProducts: Product[];
}

export interface DeliveryPaymentLoaderData {
  settings: {
    id: string;
    title: string;
    description: string | null;
    delivery_content: string | null;
    payment_content: string | null;
  };
}

const defaultDeliveryPaymentSettings = {
  id: 'default',
  title: 'Доставка и оплата',
  description: 'Удобные способы доставки и оплаты',
  delivery_content: 'Мы осуществляем доставку по всему Душанбе. Срок доставки: 1-3 рабочих дня.',
  payment_content: 'Принимаем оплату наличными при получении или онлайн через Alif Bank.',
};

export async function homePageLoader(): Promise<HomePageLoaderData> {
  const [slides, reviews, blogPosts] = await Promise.all([
    getCarouselSlides().catch(() => []),
    getCustomerReviews().catch(() => []),
    getBlogPosts({ status: 'published', limit: 4 }).catch(() => []),
  ]);

  return { slides, reviews, blogPosts };
}

export async function productsPageLoader({ request }: LoaderFunctionArgs): Promise<ProductsPageLoaderData> {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const selectedCategories = category ? [category] : [];
  const products = category ? await getProductsByCategory(category) : await getProducts();

  return { products, selectedCategories, source: 'products' };
}

export async function categoryProductsLoader({ params }: LoaderFunctionArgs): Promise<ProductsPageLoaderData> {
  const slug = params.slug ?? '';
  const products = slug ? await getProductsByCategory(slug) : await getProducts();

  return {
    products,
    selectedCategories: slug ? [slug] : [],
    source: 'categories',
  };
}

function getSizeFromFilterSlug(filterSlug: string): { width: number; length: number } | null {
  const match = filterSlug.match(/^size-(\d{2,3})x(\d{2,3})$/i);
  if (!match) return null;
  return { width: Number(match[1]), length: Number(match[2]) };
}

function buildFilterLandingMeta(slug: string, filterSlug: string) {
  const sizeFilter = getSizeFromFilterSlug(filterSlug);
  if (sizeFilter) {
    const sizeLabel = `${sizeFilter.width}х${sizeFilter.length}`;
    return {
      filterType: 'size' as const,
      filterSlug,
      filterValue: sizeLabel,
      pageTitle: `Матрасы ${sizeLabel}`,
      seoTitle: `Матрас ${sizeLabel} Душанбе`,
      seoDescription: `Матрасы ${sizeLabel} в Душанбе: ортопедические модели, цены и доставка по городу.`,
      canonicalPath: `/categories/${slug}/${filterSlug}`,
    };
  }

  const materialLabelMap: Record<string, string> = {
    latex: 'латекс',
    'memory-foam': 'memory foam',
  };
  const materialValue = materialLabelMap[filterSlug] || filterSlug.replace(/-/g, ' ');
  const materialTitle = materialValue.charAt(0).toUpperCase() + materialValue.slice(1);
  return {
    filterType: 'material' as const,
    filterSlug,
    filterValue: materialValue,
    pageTitle: `${materialTitle} матрасы`,
    seoTitle: `${materialTitle} матрасы в Душанбе`,
    seoDescription: `${materialTitle} матрасы в Душанбе: модели, размеры и доставка от Sakina.`,
    canonicalPath: `/categories/${slug}/${filterSlug}`,
  };
}

export async function categoryFilterLandingLoader({ params }: LoaderFunctionArgs): Promise<ProductsPageLoaderData> {
  const slug = params.slug ?? '';
  const filterSlug = params.filterSlug ?? '';
  const products = slug ? await getProductsByCategory(slug) : await getProducts();
  const landingMeta = buildFilterLandingMeta(slug, filterSlug);
  const sizeFilter = getSizeFromFilterSlug(filterSlug);

  const filteredProducts = products.filter((product) => {
    if (sizeFilter) {
      return (product.variants || []).some(
        (variant) => variant.width_cm === sizeFilter.width && variant.length_cm === sizeFilter.length,
      );
    }

    const materialNeedle = landingMeta.filterValue.toLowerCase();
    const materialHaystack = [
      product.filler_material,
      product.cover_material,
      product.description,
      product.name,
      product.mattress_type,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (materialNeedle === 'латекс') {
      return materialHaystack.includes('латекс') || materialHaystack.includes('latex');
    }
    if (materialNeedle === 'memory foam') {
      return (
        materialHaystack.includes('memory foam') ||
        materialHaystack.includes('memoryfoam') ||
        materialHaystack.includes('пена с эффектом памяти')
      );
    }
    return materialHaystack.includes(materialNeedle);
  });

  return {
    products: filteredProducts,
    selectedCategories: slug ? [slug] : [],
    source: 'categories',
    landingMeta,
  };
}

export async function productPageLoader({ params }: LoaderFunctionArgs): Promise<ProductPageLoaderData> {
  const id = params.id;

  if (!id) {
    return { product: null, similarProducts: [] };
  }

  const product = await getProductById(id);
  if (!product?.category) {
    return { product, similarProducts: [] };
  }

  const sameCategory = await getProductsByCategory(product.category).catch(() => []);
  const similarProducts = sameCategory.filter((item) => item.id !== product.id).slice(0, 4);
  return { product, similarProducts };
}

export async function deliveryPaymentLoader(): Promise<DeliveryPaymentLoaderData> {
  const settings = (await getDeliveryPaymentSettings().catch(() => null)) ?? defaultDeliveryPaymentSettings;
  return { settings };
}

export async function contactsLoader() {
  const categories = await getCategories().catch(() => []);
  return { categories };
}

export interface FaqPageLoaderData {
  faqItems: FaqItem[];
}

export async function faqPageLoader(): Promise<FaqPageLoaderData> {
  const faqItems = await getFaqItems().catch(() => []);
  return { faqItems };
}
