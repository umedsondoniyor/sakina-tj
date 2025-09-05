// src/components/ProductsPage.tsx
import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Product } from '../lib/types';

import ProductGrid from './products/ProductGrid';
import ProductFilters from './products/ProductFilters';
import MobileFilters from './products/MobileFilters';
import SortModal from './products/SortModal';
import MobileFilterBar from './products/MobileFilterBar';
import QuickFilters from './products/QuickFilters';
import CategoryAlert from './products/CategoryAlert';

type FilterState = {
  age: string[];
  hardness: string[];
  width: number[];   // [min,max]
  length: number[];  // [min,max]
  height: number[];  // [min,max]
  price: number[];   // [min,max]
  inStock: boolean;
  productType: string[];   // selected categories
  mattressType: string[];
  preferences: string[];   // (not used server-side now)
  functions: string[];     // (not used server-side now)
  weightCategory: string[];
};

const categoryDisplayNames: Record<string, string> = {
  mattresses: 'Матрасы',
  beds: 'Кровати',
  smartchair: 'Массажные кресла',
  map: 'Карты',
  pillows: 'Подушки',
  blankets: 'Одеяла',
  furniture: 'Мебель',
};

// ---------- Helpers ----------
const urlSelectedCategories = (
  location: ReturnType<typeof useLocation>,
  searchParams: URLSearchParams
) => {
  const st = location.state as any;
  if (st?.selectedCategories) return st.selectedCategories as string[];
  const single = searchParams.get('category');
  return single ? [single] : [];
};

type VariantRow = {
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
  // joins
  products: Product;
  inventory?: { in_stock: boolean; stock_quantity: number | null }[] | null;
};

type Item = {
  product: Product;
  variants: VariantRow[];
  primary: VariantRow; // variant chosen to display price/size
};

// Choose which variant becomes the “primary” for a product card
const choosePrimary = (variants: VariantRow, all: VariantRow[]) => {
  return all.slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
};

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  // Read initial categories from URL (or location.state)
  const initialCats = React.useMemo(() => urlSelectedCategories(location, sp), [location.key, sp.toString()]);

  // UI state
  const [showFilters, setShowFilters] = React.useState(false);
  const [showSortModal, setShowSortModal] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<string>((location.state as any)?.sortBy || 'popularity');

  // Filters
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(initialCats);
  const [filters, setFilters] = React.useState<FilterState>({
    age: [],
    hardness: [],
    width: [],
    length: [],
    height: [],
    price: [],
    inStock: false,
    productType: initialCats,
    mattressType: [],
    preferences: [],
    functions: [],
    weightCategory: [],
  });

  // Data
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Keep sidebar categories in sync when URL-based categories change
  React.useEffect(() => {
    setSelectedCategories(initialCats);
    setFilters(prev => ({ ...prev, productType: initialCats }));
  }, [initialCats]);

  // Load from Supabase whenever filters or categories change
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ----- Base select with joins -----
        // NOTE: use !inner on products so category filter works at the same query
        let q = supabase
          .from('product_variants')
          .select(
            `
              *,
              products!inner(*),
              inventory(in_stock, stock_quantity)
            `
          )
          .order('display_order', { ascending: true }) as any;

        // ----- Category (products.category) -----
        if (filters.productType?.length) {
          q = q.in('products.category', filters.productType);
        }

        // ----- Hardness (products.hardness) -----
        if (filters.hardness?.length) {
          q = q.in('products.hardness', filters.hardness);
        }

        // ----- Mattress type (products.mattress_type) -----
        if (filters.mattressType?.length) {
          q = q.in('products.mattress_type', filters.mattressType);
        }

        // ----- Weight category (products.weight_category) -----
        if (filters.weightCategory?.length) {
          q = q.in('products.weight_category', filters.weightCategory);
        }

        // ----- In stock (inventory.in_stock) -----
        if (filters.inStock) {
          // When filtering by a joined table, inner join is safer:
          // do an additional filter that at least one joined inventory row is in_stock=true.
          q = q.eq('inventory.in_stock', true);
        }

        // ----- Variant numeric ranges -----
        if (filters.width?.length === 2) {
          const [min, max] = filters.width;
          if (Number.isFinite(min)) q = q.gte('width_cm', min);
          if (Number.isFinite(max)) q = q.lte('width_cm', max);
        }
        if (filters.length?.length === 2) {
          const [min, max] = filters.length;
          if (Number.isFinite(min)) q = q.gte('length_cm', min);
          if (Number.isFinite(max)) q = q.lte('length_cm', max);
        }
        if (filters.height?.length === 2) {
          const [min, max] = filters.height;
          if (Number.isFinite(min)) q = q.gte('height_cm', min);
          if (Number.isFinite(max)) q = q.lte('height_cm', max);
        }

        // ----- Price range (by variant price) -----
        if (filters.price?.length === 2) {
          const [min, max] = filters.price;
          if (Number.isFinite(min)) q = q.gte('price', min);
          if (Number.isFinite(max)) q = q.lte('price', max);
        }

        const { data, error } = await q;
        if (error) throw error;

        const rows = (data ?? []) as VariantRow[];

        // Group by product_id
        const byProduct = new Map<string, { product: Product; variants: VariantRow[] }>();
        for (const r of rows) {
          const key = r.product_id;
          const existing = byProduct.get(key);
          if (existing) {
            existing.variants.push(r);
          } else {
            byProduct.set(key, { product: r.products, variants: [r] });
          }
        }

        const grouped: Item[] = Array.from(byProduct.values()).map(({ product, variants }) => ({
          product,
          variants,
          primary: choosePrimary(variants[0], variants),
        }));

        if (cancelled) return;

        // Sorting — apply to product cards level
        let sorted = grouped.slice();

        const discountValue = (p: Item) => {
          const cur = p.primary;
          if (cur.old_price && cur.price) return Number(cur.old_price) - Number(cur.price);
          if (p.product.sale_percentage) return p.product.sale_percentage;
          return 0;
        };

        switch (sortBy) {
          case 'price-asc':
            sorted.sort((a, b) => Number(a.primary.price) - Number(b.primary.price));
            break;
          case 'price-desc':
            sorted.sort((a, b) => Number(b.primary.price) - Number(a.primary.price));
            break;
          case 'rating':
            sorted.sort((a, b) => Number(b.product.rating ?? 0) - Number(a.product.rating ?? 0));
            break;
          case 'reviews':
            sorted.sort((a, b) => Number(b.product.review_count ?? 0) - Number(a.product.review_count ?? 0));
            break;
          case 'new':
            sorted.sort(
              (a, b) =>
                new Date(b.product.created_at as any).getTime() -
                new Date(a.product.created_at as any).getTime()
            );
            break;
          case 'in-stock':
            sorted.sort((a, b) => {
              const av = a.variants.some(v => v.inventory?.some(i => i.in_stock)) ? 1 : 0;
              const bv = b.variants.some(v => v.inventory?.some(i => i.in_stock)) ? 1 : 0;
              if (bv !== av) return bv - av;
              // tie-break by popularity
              const ap = (a.product.review_count ?? 0) * (a.product.rating ?? 0);
              const bp = (b.product.review_count ?? 0) * (b.product.rating ?? 0);
              return bp - ap;
            });
            break;
          case 'discount':
            sorted.sort((a, b) => discountValue(b) - discountValue(a));
            break;
          default: {
            // popularity
            sorted.sort((a, b) => {
              const ap = (a.product.review_count ?? 0) * (a.product.rating ?? 0);
              const bp = (b.product.review_count ?? 0) * (b.product.rating ?? 0);
              return bp - ap;
            });
          }
        }

        setItems(sorted);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setItems([]);
          setError(e?.message ?? 'Не удалось загрузить товары');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters, selectedCategories, sortBy]);

  // Category change from sidebar
  const handleCategoryChange = React.useCallback(
    (categoryValue: string, isChecked: boolean) => {
      const next = isChecked
        ? Array.from(new Set([...selectedCategories, categoryValue]))
        : selectedCategories.filter(c => c !== categoryValue);

      setSelectedCategories(next);
      setFilters(prev => ({ ...prev, productType: next }));
    },
    [selectedCategories]
  );

  const clearFilters = React.useCallback(() => {
    setFilters({
      age: [],
      hardness: [],
      width: [],
      length: [],
      height: [],
      price: [],
      inStock: false,
      productType: [],
      mattressType: [],
      preferences: [],
      functions: [],
      weightCategory: [],
    });
    setSelectedCategories([]);
  }, []);

  const clearCategories = React.useCallback(() => {
    setSelectedCategories([]);
    setFilters(prev => ({ ...prev, productType: [] }));
  }, []);

  // Render
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid gap-8 grid-cols-1 md:grid-cols-[280px_1fr]">
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-64 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{error}</h3>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              // force a refetch by touching filters
              setFilters(prev => ({ ...prev }));
            }}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const pageTitle =
    selectedCategories.length === 1
      ? categoryDisplayNames[selectedCategories[0]] || 'Товары'
      : 'Все товары';

  // Adapt items to the ProductGrid's expected shape:
  // override product price/old_price with the primary variant’s values for display
  const gridProducts: Product[] = items.map(({ product, primary }) => ({
    ...product,
    price: Number(primary.price),
    old_price: primary.old_price != null ? Number(primary.old_price) : product.old_price,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6" aria-live="polite">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-600">
            {selectedCategories.length === 1
              ? `Найдено ${items.length} товаров в категории "${categoryDisplayNames[selectedCategories[0]]}"`
              : `Найдено ${items.length} товаров`}
          </p>
        </header>

        {/* Category Alert */}
        <CategoryAlert
          selectedCategories={selectedCategories}
          categoryDisplayNames={categoryDisplayNames}
          onClearCategories={clearCategories}
        />

        {/* Quick Filters */}
        <QuickFilters selectedCategories={selectedCategories} />

        {/* Mobile Filter Bar */}
        <MobileFilterBar
          onShowFilters={() => setShowFilters(true)}
          onShowSort={() => setShowSortModal(true)}
          sortBy={sortBy}
        />

        {/* Layout */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* Desktop Filters */}
          <aside className="hidden md:block">
            <div className="md:sticky md:top-4">
              <ProductFilters
                filters={filters}
                setFilters={setFilters}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                onClearFilters={clearFilters}
                categoryDisplayNames={categoryDisplayNames}
              />
            </div>
          </aside>

          {/* Products + Desktop Sort */}
          <section className="flex-1" aria-label="Список товаров">
            <div className="hidden md:flex justify-between items-center mb-6">
              <span className="text-gray-600">Показано {items.length}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="popularity">По популярности</option>
                <option value="price-desc">По убыванию цены</option>
                <option value="price-asc">По возрастанию цены</option>
                <option value="in-stock">По наличию</option>
                <option value="discount">По скидке</option>
                <option value="new">По новизне</option>
                <option value="rating">По рейтингу</option>
                <option value="reviews">По количеству отзывов</option>
              </select>
            </div>

            <ProductGrid
              products={gridProducts}
              onProductClick={(id) => navigate(`/products/${id}`)}
            />
          </section>
        </div>

        {/* Mobile Modals */}
        <MobileFilters
          showFilters={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
          productsCount={items.length}
        />
        <SortModal
          showSortModal={showSortModal}
          onClose={() => setShowSortModal(false)}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
