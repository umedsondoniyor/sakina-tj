// src/components/ProductsPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import { getProducts } from '../lib/api';
import type { Product } from '../lib/types';

import ProductGrid from './products/ProductGrid';
import ProductFilters from './products/ProductFilters';
import MobileFilters from './products/MobileFilters';
import SortModal from './products/SortModal';
import MobileFilterBar from './products/MobileFilterBar';
import QuickFilters from './products/QuickFilters';
import CategoryAlert from './products/CategoryAlert';

interface FilterState {
  age: string[];
  hardness: string[];
  width: number[];   // [min,max]
  length: number[];  // [min,max]
  height: number[];  // [min,max]
  price: number[];   // [min,max]
  inStock: boolean;
  productType: string[]; // selected categories
  mattressType: string[];
  preferences: string[];
  functions: string[];
  weightCategory: string[];
}

const categoryDisplayNames: Record<string, string> = {
  mattresses: 'Матрасы',
  beds: 'Кровати',
  smartchair: 'Массажные кресла',
  map: 'Карты',
  pillows: 'Подушки',
  blankets: 'Одеяла',
  furniture: 'Мебель',
};

const inRange = (val: number | undefined, range?: number[]) => {
  if (!range || range.length < 2) return true;
  if (val == null) return false;
  let [min, max] = range;
  // -1 means "not set" so ignore that boundary
  if (min === -1) min = undefined as any;
  if (max === -1) max = undefined as any;
  // If both are set and min > max, swap them for filtering
  if (min != null && max != null && min > max) {
    [min, max] = [max, min];
  }
  if (typeof min === 'number' && val < min) return false;
  if (typeof max === 'number' && val > max) return false;
  return true;
};

const hasAny = (arr?: any[]) => Array.isArray(arr) && arr.length > 0;

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Categories derived from URL or navigation state
  const urlSelectedCategories = useMemo<string[]>(() => {
    const st = location.state as any;
    if (st?.selectedCategories) return st.selectedCategories as string[];

    const categoryParam = searchParams.get('category');
    if (categoryParam) return [categoryParam];

    return [];
  }, [location.key, searchParams.toString()]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [activeQuickSize, setActiveQuickSize] = useState<string | null>(null);

  // Live category state (seeded from URL or quiz)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const state = location.state as any;
    if (state?.filters) {
      // Coming from quiz - show mattresses
      return ['mattresses'];
    }
    return urlSelectedCategories;
  });

  const [showFilters, setShowFilters]     = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy]               = useState<string>((location.state as any)?.sortBy || 'popularity');

  const [filters, setFilters] = useState<FilterState>(() => {
    // Check if coming from quiz with filters
    const state = location.state as any;
    const quizFilters = state?.filters;

    if (quizFilters) {
      return {
        age: quizFilters.age || [],
        hardness: quizFilters.hardness || [],
        width: quizFilters.width || [],
        length: quizFilters.length || [],
        height: quizFilters.height || [],
        price: quizFilters.price || [],
        inStock: quizFilters.inStock || false,
        productType: ['mattresses'], // Quiz is for mattresses
        mattressType: quizFilters.mattressType || [],
        preferences: quizFilters.preferences || [],
        functions: quizFilters.functions || [],
        weightCategory: quizFilters.weightCategory || [],
      };
    }

    return {
      age: [],
      hardness: [],
      width: [],
      length: [],
      height: [],
      price: [],
      inStock: false,
      productType: urlSelectedCategories,
      mattressType: [],
      preferences: [],
      functions: [],
      weightCategory: [],
    };
  });

  // Fetch all products once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Keep categories in sync with the URL (but don't override quiz selections)
  useEffect(() => {
    const state = location.state as any;
    // Don't sync if we came from the quiz (quiz sets its own categories)
    if (state?.filters) return;

    setSelectedCategories(urlSelectedCategories);
    setFilters(prev => ({ ...prev, productType: urlSelectedCategories }));
  }, [urlSelectedCategories, location.state]);

  // Real “clear categories”: also clear URL & navigation state
  const clearCategories = useCallback(() => {
    // Remove ?category=… from the URL and clear state
    navigate('/products', { replace: true, state: {} });
    setSelectedCategories([]);
    setFilters(prev => ({ ...prev, productType: [] }));
  }, [navigate]);

  // “Clear filters” should NOT touch categories
  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      age: [],
      hardness: [],
      width: [],
      length: [],
      height: [],
      price: [],
      inStock: false,
      mattressType: [],
      preferences: [],
      functions: [],
      weightCategory: [],
      // DO NOT reset productType here
    }));
    // DO NOT touch selectedCategories here
  }, []);

  const handleCategoryChange = useCallback((categoryValue: string, isChecked: boolean) => {
    const newCategories = isChecked
      ? Array.from(new Set([...selectedCategories, categoryValue]))
      : selectedCategories.filter(cat => cat !== categoryValue);

    setSelectedCategories(newCategories);
    setFilters(prev => ({ ...prev, productType: newCategories }));
  }, [selectedCategories]);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    let list = products.slice();

    // Category filter (from live selection)
    if (hasAny(selectedCategories)) {
      list = list.filter(p => selectedCategories.includes(p.category));
    }

    // Age
    if (hasAny(filters.age)) {
      list = list.filter(p => (p as any).age && filters.age.includes((p as any).age));
    }

    // Hardness
    if (hasAny(filters.hardness)) {
      list = list.filter(p => p.hardness && filters.hardness.includes(p.hardness));
    }

    // Weight category
    if (hasAny(filters.weightCategory)) {
      list = list.filter(p => p.weight_category && filters.weightCategory.includes(p.weight_category));
    }

    // Mattress type
    if (hasAny(filters.mattressType)) {
      const key = (p: Product) => (p as any).mattress_type || (p as any).mattressType;
      list = list.filter(p => {
        const mt = key(p);
        return mt && filters.mattressType.includes(mt);
      });
    }

    // Preferences / functions (arrays on product if you add them)
    if (hasAny(filters.preferences)) {
      list = list.filter(p =>
        Array.isArray((p as any).preferences) &&
        (p as any).preferences.some((x: string) => filters.preferences.includes(x))
      );
    }
    if (hasAny(filters.functions)) {
      list = list.filter(p =>
        Array.isArray((p as any).functions) &&
        (p as any).functions.some((x: string) => filters.functions.includes(x))
      );
    }

    // In stock (any variant in stock)
    if (filters.inStock) {
      list = list.filter(p => p.variants?.some(v => (v as any).inventory?.in_stock));
    }

    // Numeric ranges - check variants for dimensions
    if (filters.width.length === 2) {
      list = list.filter(p =>
        p.variants?.some(v => inRange(v.width_cm, filters.width))
      );
    }
    if (filters.length.length === 2) {
      list = list.filter(p =>
        p.variants?.some(v => inRange(v.length_cm, filters.length))
      );
    }
    if (filters.height.length === 2) {
      list = list.filter(p =>
        p.variants?.some(v => inRange(v.height_cm, filters.height))
      );
    }
    if (filters.price.length === 2)  list = list.filter(p => inRange(p.price, filters.price));

    // Sorting
    const discountValue = (p: Product) => {
      if (p.old_price && p.price) return p.old_price - p.price;
      if ((p as any).sale_percentage) return (p as any).sale_percentage;
      return 0;
    };

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'reviews':
        list.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
        break;
      case 'new':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'in-stock':
        list.sort((a, b) => {
          const av = a.variants?.some(v => (v as any).inventory?.in_stock) ? 1 : 0;
          const bv = b.variants?.some(v => (v as any).inventory?.in_stock) ? 1 : 0;
          if (bv !== av) return bv - av;
          const ap = (a.review_count ?? 0) * (a.rating ?? 0);
          const bp = (b.review_count ?? 0) * (b.rating ?? 0);
          return bp - ap;
        });
        break;
      case 'discount':
        list.sort((a, b) => discountValue(b) - discountValue(a));
        break;
      default: // popularity
        list.sort((a, b) => {
          const ap = (a.review_count ?? 0) * (a.rating ?? 0);
          const bp = (b.review_count ?? 0) * (b.rating ?? 0);
          return bp - ap;
        });
    }

    return list;
  }, [products, selectedCategories, filters, sortBy]);

  const handleQuickSizeSelect = useCallback(
  ({ label, width, length }: { label: string; width: number; length: number }) => {
    setActiveQuickSize((prev) => {
      const isSame = prev === label;

      if (isSame) {
        // Toggle OFF: clear size filters
        setFilters((f) => ({
          ...f,
          width: [],
          length: [],
        }));
        return null;
      }

      // Toggle ON: apply exact width/length range
      setFilters((f) => ({
        ...f,
        width: [width, width],
        length: [length, length],
      }));
      return label;
    });
  },
  [setFilters]
);

const handleOpenMattressWizard = useCallback(() => {
  // change route if your builder path is different
  navigate("/mattress-builder");
}, [navigate]);


  // UI states
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
              getProducts()
                .then((data) => setProducts(Array.isArray(data) ? data : []))
                .catch(() => setError('Не удалось загрузить товары'))
                .finally(() => setLoading(false));
            }}
            className="mt-4 px-4 py-2 bg-brand-turquoise text-white hover:bg-brand-navy"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  const pageTitle =
    selectedCategories.length === 1
      ? categoryDisplayNames[selectedCategories[0]] || 'Товары'
      : 'Все товары';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6" aria-live="polite">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-600">
            {selectedCategories.length === 1
              ? `Найдено ${filteredProducts.length} товаров в категории "${categoryDisplayNames[selectedCategories[0]]}"`
              : `Найдено ${filteredProducts.length} товаров`}
          </p>
        </header>

        {/* Category Alert */}
        <CategoryAlert
          selectedCategories={selectedCategories}
          categoryDisplayNames={categoryDisplayNames}
          onClearCategories={clearCategories}
        />

        {/* Quick Filters */}
        <QuickFilters
          selectedCategories={selectedCategories}
          activeSize={activeQuickSize}
          onSelectSize={handleQuickSizeSelect}
          onOpenMattressWizard={handleOpenMattressWizard}
        />


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
              <span className="text-gray-600">
                Показано {filteredProducts.length} из {products.length} товаров
              </span>
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
                {/* <option value="reviews">По количеству отзывов</option> */}
              </select>
            </div>

            <ProductGrid
              products={filteredProducts}
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
          productsCount={filteredProducts.length}
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