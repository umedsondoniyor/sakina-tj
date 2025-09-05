import React, { useEffect, useMemo, useRef, useState } from 'react';
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

type Range = [number, number] | [];
type FilterState = {
  age: string[];
  hardness: string[];
  width: Range;
  length: Range;
  height: Range;
  price: Range;
  inStock: boolean;
  productType: string[];     // categories
  mattressType: string[];
  preferences: string[];
  functions: string[];
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

// --- URL helpers
const csv = (arr: string[]) => arr.join(',');
const parseCsv = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

const parseRange = (min: string | null, max: string | null): Range => {
  if (!min && !max) return [];
  const lo = min ? Number(min) : Number.MIN_SAFE_INTEGER;
  const hi = max ? Number(max) : Number.MAX_SAFE_INTEGER;
  return [lo, hi];
};
const rangeParts = (r: Range) =>
  Array.isArray(r) && r.length === 2 ? { min: String(r[0]), max: String(r[1]) } : { min: '', max: '' };

const inRange = (val?: number, r?: Range) => {
  if (val == null) return false;
  if (!r || r.length < 2) return true;
  return val >= r[0] && val <= r[1];
};

const hasAny = (a?: any[]) => Array.isArray(a) && a.length > 0;

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // --- Local filter state mirrors the URL
  const [filters, setFilters] = useState<FilterState>({
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

  // Load products once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Parse URL → filters (runs on URL change)
  useEffect(() => {
    const f: FilterState = {
      age:            parseCsv(searchParams.get('age')),
      hardness:       parseCsv(searchParams.get('hardness')),
      productType:    parseCsv(searchParams.get('category')), // one or more
      mattressType:   parseCsv(searchParams.get('mattressType')),
      preferences:    parseCsv(searchParams.get('preferences')),
      functions:      parseCsv(searchParams.get('functions')),
      weightCategory: parseCsv(searchParams.get('weightCategory')),

      inStock: searchParams.get('inStock') === '1',

      width:  parseRange(searchParams.get('widthMin'),  searchParams.get('widthMax')),
      length: parseRange(searchParams.get('lengthMin'), searchParams.get('lengthMax')),
      height: parseRange(searchParams.get('heightMin'), searchParams.get('heightMax')),
      price:  parseRange(searchParams.get('priceMin'),  searchParams.get('priceMax')),
    };
    setFilters(f);
  }, [searchParams]);

  // --- Push filters → URL (debounced & cycle-safe)
  const lastSerialized = useRef<string>('');
  useEffect(() => {
    const sp = new URLSearchParams();

    if (hasAny(filters.productType))    sp.set('category', csv(filters.productType));
    if (hasAny(filters.hardness))       sp.set('hardness', csv(filters.hardness));
    if (hasAny(filters.age))            sp.set('age', csv(filters.age));
    if (hasAny(filters.mattressType))   sp.set('mattressType', csv(filters.mattressType));
    if (hasAny(filters.preferences))    sp.set('preferences', csv(filters.preferences));
    if (hasAny(filters.functions))      sp.set('functions', csv(filters.functions));
    if (hasAny(filters.weightCategory)) sp.set('weightCategory', csv(filters.weightCategory));
    if (filters.inStock)                sp.set('inStock', '1');

    const w = rangeParts(filters.width);
    const l = rangeParts(filters.length);
    const h = rangeParts(filters.height);
    const p = rangeParts(filters.price);
    if (w.min) sp.set('widthMin',  w.min);
    if (w.max) sp.set('widthMax',  w.max);
    if (l.min) sp.set('lengthMin', l.min);
    if (l.max) sp.set('lengthMax', l.max);
    if (h.min) sp.set('heightMin', h.min);
    if (h.max) sp.set('heightMax', h.max);
    if (p.min) sp.set('priceMin',  p.min);
    if (p.max) sp.set('priceMax',  p.max);

    const serialized = sp.toString();
    if (serialized !== lastSerialized.current) {
      lastSerialized.current = serialized;
      setSearchParams(sp, { replace: true });
    }
  }, [filters, setSearchParams]);

  // --- Derived
  const selectedCategories = filters.productType;
  const pageTitle =
    selectedCategories.length === 1
      ? categoryDisplayNames[selectedCategories[0]] || 'Товары'
      : selectedCategories.length > 1
      ? selectedCategories.map(c => categoryDisplayNames[c] || c).join(' + ')
      : 'Все товары';

  // --- Filtering + sorting (kept simple)
  const [sortBy, setSortBy] = useState('popularity');

  const filteredProducts = useMemo(() => {
    let list = products.slice();

    if (hasAny(filters.productType)) {
      list = list.filter(p => filters.productType.includes(p.category));
    }
    if (hasAny(filters.hardness)) {
      list = list.filter(p => p.hardness && filters.hardness.includes(p.hardness));
    }
    if (hasAny(filters.weightCategory)) {
      list = list.filter(p => p.weight_category && filters.weightCategory.includes(p.weight_category));
    }
    if (hasAny(filters.mattressType)) {
      const key = (p: Product) => (p as any).mattress_type || (p as any).mattressType;
      list = list.filter(p => {
        const mt = key(p);
        return mt && filters.mattressType.includes(mt);
      });
    }
    if (filters.inStock) {
      list = list.filter(p => p.variants?.some(v => v.inventory?.in_stock));
    }

    if (filters.price.length === 2)  list = list.filter(p => inRange(p.price, filters.price));

    // NOTE: width/length/height are variant-level; apply if any variant matches
    const variantInRange = (p: Product, key: 'width_cm'|'length_cm'|'height_cm', r: Range) =>
      !r.length || p.variants?.some(v => inRange((v as any)[key], r));
    if (filters.width.length === 2)  list = list.filter(p => variantInRange(p, 'width_cm',  filters.width));
    if (filters.length.length === 2) list = list.filter(p => variantInRange(p, 'length_cm', filters.length));
    if (filters.height.length === 2) list = list.filter(p => variantInRange(p, 'height_cm', filters.height));

    switch (sortBy) {
      case 'price-asc':  list.sort((a,b)=> (a.price??0)-(b.price??0)); break;
      case 'price-desc': list.sort((a,b)=> (b.price??0)-(a.price??0)); break;
      case 'rating':     list.sort((a,b)=> (b.rating??0)-(a.rating??0)); break;
      case 'reviews':    list.sort((a,b)=> (b.review_count??0)-(a.review_count??0)); break;
      default:
        list.sort((a,b)=>{
          const ap=(a.review_count??0)*(a.rating??0);
          const bp=(b.review_count??0)*(b.rating??0);
          return bp-ap;
        });
    }
    return list;
  }, [products, filters, sortBy]);

  const clearCategories = () => {
    setFilters(prev => ({ ...prev, productType: [] }));
  };
  const clearAll = () => {
    setFilters({
      age: [], hardness: [], width: [], length: [], height: [], price: [],
      inStock: false, productType: [], mattressType: [], preferences: [],
      functions: [], weightCategory: [],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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
              setError(null); setLoading(true);
              getProducts()
                .then(d=>setProducts(Array.isArray(d)?d:[]))
                .catch(()=>setError('Failed to load products'))
                .finally(()=>setLoading(false));
            }}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-600">Найдено {filteredProducts.length} товаров</p>
        </header>

        {/* Category Alert */}
        <CategoryAlert
          selectedCategories={filters.productType}
          categoryDisplayNames={categoryDisplayNames}
          onClearCategories={clearCategories}
        />

        {/* Quick Filters */}
        <QuickFilters selectedCategories={filters.productType} />

        {/* Mobile Filter Bar */}
        <MobileFilterBar
          onShowFilters={() => {/* handled by MobileFilters component */}}
          onShowSort={() => {/* handled by SortModal */}}
          sortBy={sortBy}
        />

        <div className="grid gap-8 grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <div className="md:sticky md:top-4">
              <ProductFilters
                filters={filters}
                setFilters={setFilters}
                selectedCategories={filters.productType}
                onCategoryChange={(cat, checked) =>
                  setFilters(prev => ({
                    ...prev,
                    productType: checked
                      ? Array.from(new Set([...(prev.productType||[]), cat]))
                      : (prev.productType||[]).filter(c => c !== cat),
                  }))
                }
                onClearFilters={clearAll}
                categoryDisplayNames={categoryDisplayNames}
              />
            </div>
          </aside>

          {/* Products + sort */}
          <section className="flex-1" aria-label="Список товаров">
            <div className="hidden md:flex justify-between items-center mb-6">
              <span className="text-gray-600">
                Показано {filteredProducts.length} из {products.length}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="popularity">По популярности</option>
                <option value="price-desc">По убыванию цены</option>
                <option value="price-asc">По возрастанию цены</option>
                <option value="rating">По рейтингу</option>
                <option value="reviews">По количеству отзывов</option>
              </select>
            </div>

            <ProductGrid
              products={filteredProducts}
              onProductClick={(id)=>navigate(`/products/${id}`)}
            />
          </section>
        </div>

        {/* Mobile Modals */}
        <MobileFilters
          showFilters={false}
          onClose={()=>{}}
          filters={filters}
          setFilters={setFilters}
          productsCount={filteredProducts.length}
        />
        <SortModal
          showSortModal={false}
          onClose={()=>{}}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>
    </div>
  );
};

export default ProductsPage;