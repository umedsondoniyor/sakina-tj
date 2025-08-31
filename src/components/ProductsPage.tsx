import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  width: number[];
  length: number[];
  height: number[];
  price: number[];
  inStock: boolean;
  productType: string[];
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

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- helpers to read initial categories from nav state or URL
  const getInitialCategories = useCallback(() => {
    if ((location.state as any)?.selectedCategories) {
      return (location.state as any).selectedCategories as string[];
    }
    const categoryParam = searchParams.get('category');
    if (categoryParam) return [categoryParam];
    return [];
  }, [location.state, searchParams]);

  // --- state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(getInitialCategories());
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState(
    (location.state as any)?.sortBy || 'popularity'
  );

  const [filters, setFilters] = useState<FilterState>({
    age: [],
    hardness: [],
    width: [],
    length: [],
    height: [],
    price: [],
    inStock: false,
    productType: getInitialCategories(),
    mattressType: [],
    preferences: [],
    functions: [],
    weightCategory: [],
  });

  // --- load products once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- react to navigation/URL changes for categories
  useEffect(() => {
    const newCats = getInitialCategories();
    // avoid churn
    if (JSON.stringify(newCats) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(newCats);
      setFilters((prev) => ({ ...prev, productType: newCats }));
    }
  }, [getInitialCategories, selectedCategories]);

  // --- filtering + sorting (memoized; no setState loop)
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    let list = products.slice();

    // Category
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    // Hardness
    if (filters.hardness.length > 0) {
      list = list.filter(
        (p) => p.hardness && filters.hardness.includes(p.hardness)
      );
    }

    // Weight category
    if (filters.weightCategory.length > 0) {
      list = list.filter(
        (p) => p.weight_category && filters.weightCategory.includes(p.weight_category)
      );
    }

    // In stock (as a filter)
    if (filters.inStock) {
      list = list.filter((p) =>
        p.variants?.some((v) => v.inventory?.in_stock)
      );
    }

    // TODO: width/length/height/price filters can be applied here as needed
    // (Left as-is to not change current behavior)

    // Sorting
    const byDiscountValue = (p: Product) => {
      // compute discount value or percentage if available
      if (p.old_price && p.price) return p.old_price - p.price;
      if (p.sale_percentage) return p.sale_percentage; // fallback
      return 0;
    };

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'reviews':
        list.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'new':
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'in-stock':
        // bring in-stock first, then keep relative popularity
        list.sort((a, b) => {
          const aStock = a.variants?.some((v) => v.inventory?.in_stock) ? 1 : 0;
          const bStock = b.variants?.some((v) => v.inventory?.in_stock) ? 1 : 0;
          if (bStock !== aStock) return bStock - aStock;
          // tie-breaker: popularity
          const ap = (a.review_count || 0) * (a.rating || 0);
          const bp = (b.review_count || 0) * (b.rating || 0);
          return bp - ap;
        });
        break;
      case 'discount':
        // biggest discount first
        list.sort((a, b) => byDiscountValue(b) - byDiscountValue(a));
        break;
      default:
        // popularity
        list.sort((a, b) => {
          const ap = (a.review_count || 0) * (a.rating || 0);
          const bp = (b.review_count || 0) * (b.rating || 0);
          return bp - ap;
        });
    }

    return list;
  }, [products, selectedCategories, filters, sortBy]);

  // --- handlers
  const handleCategoryChange = useCallback(
    (categoryValue: string, isChecked: boolean) => {
      const newCategories = isChecked
        ? [...selectedCategories, categoryValue]
        : selectedCategories.filter((cat) => cat !== categoryValue);

      setSelectedCategories(newCategories);
      setFilters((prev) => ({ ...prev, productType: newCategories }));
    },
    [selectedCategories]
  );

  const clearFilters = useCallback(() => {
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

  const clearCategories = useCallback(() => {
    setSelectedCategories([]);
    setFilters((prev) => ({ ...prev, productType: [] }));
  }, []);

  const handleProductClick = useCallback(
    (productId: string) => {
      navigate(`/products/${productId}`);
    },
    [navigate]
  );

  // --- UI states
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
                .catch(() => setError('Failed to load products'))
                .finally(() => setLoading(false));
            }}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // selected category title
  const pageTitle =
    selectedCategories.length === 1
      ? categoryDisplayNames[selectedCategories[0]] || 'Товары'
      : 'Все товары';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6" aria-live="polite">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {pageTitle}
          </h1>
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
        <QuickFilters selectedCategories={selectedCategories} />

        {/* Mobile Filter Bar */}
        <MobileFilterBar
          onShowFilters={() => setShowFilters(true)}
          onShowSort={() => setShowSortModal(true)}
          sortBy={sortBy}
        />

        {/* Main content layout:
            - mobile: single column (filters hidden inside MobileFilters)
            - desktop: 280px sidebar + fluid content
        */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* Desktop Filters (ProductFilters is already responsive; keep as-is) */}
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
                <option value="reviews">По количеству отзывов</option>
              </select>
            </div>

            <ProductGrid
              products={filteredProducts}
              onProductClick={handleProductClick}
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
