import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Product } from '../lib/types';

import {
  ProductFilters,
  MobileFilters,
  SortModal,
  ProductGrid,
  QuickFilters,
  MobileFilterBar,
  CategoryAlert
} from './products';

import { getInitialAgeFilter, categoryDisplayNames, processNavigationState } from '../utils/productHelpers';
import { getProductsQuery } from '../lib/api';

const defaultFilterState = {
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
  functions: []
};

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const initialFilters = location.state?.filters || {};
  const selections = location.state?.selections || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  const [selectedCategories, setSelectedCategories] = useState<string[]>(processNavigationState(location, currentCategory));
  const [filters, setFilters] = useState({
    ...defaultFilterState,
    age: getInitialAgeFilter(selections),
    width: initialFilters.width || [],
    length: initialFilters.length || [],
    height: initialFilters.height || [],
    price: initialFilters.price || [],
    inStock: initialFilters.inStock || false,
    productType: [currentCategory || 'mattress'],
    mattressType: initialFilters.mattressType || [],
    preferences: initialFilters.preferences || [],
    functions: initialFilters.functions || []
  });

  const categoryDisplayName = useMemo(() => {
    return categoryDisplayNames[currentCategory] || 'Все товары';
  }, [currentCategory]);

  useEffect(() => {
    if (selectedCategories.length) {
      setFilters(prev => ({ ...prev, productType: selectedCategories }));
    }
  }, [selectedCategories]);

  useEffect(() => {
    const newCategories = processNavigationState(location, currentCategory);
    if (JSON.stringify(newCategories) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(newCategories);
    }
    if (location.state?.selectedCategories) {
      Promise.resolve().then(() => {
        navigate(location.pathname + location.search, { replace: true, state: null });
      });
    }
  }, [currentCategory, location.state, navigate]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategories, filters, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = getProductsQuery(supabase, selectedCategories);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      const sortedProducts = sortProducts(data || [], sortBy);
      setProducts(sortedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (items: Product[], sort: string): Product[] => {
    switch (sort) {
      case 'price-asc': return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...items].sort((a, b) => b.price - a.price);
      case 'rating': return [...items].sort((a, b) => b.rating - a.rating);
      default: return [...items].sort((a, b) => b.review_count - a.review_count);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updated = checked
      ? [...new Set([...selectedCategories, category])]
      : selectedCategories.filter(c => c !== category);
    setSelectedCategories(updated);
    navigate(updated.length ? `/products?category=${updated[0]}` : '/products', { replace: true });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFilters(defaultFilterState);
    navigate('/products', { replace: true });
  };

  const clearCategories = () => {
    setSelectedCategories([]);
    navigate('/products', { replace: true });
  };

  const handleProductClick = (productId: string) => navigate(`/products/${productId}`);

  if (loading) return <LoadingPlaceholder />;
  if (error) return <ErrorView error={error} retry={loadProducts} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb category={categoryDisplayName} />
      <h1 className="text-2xl font-bold mb-6">{categoryDisplayName}</h1>
      <QuickFilters />
      <MobileFilterBar onShowFilters={() => setShowFilters(true)} onShowSort={() => setShowSortModal(true)} sortBy={sortBy} />
      <div className="flex gap-8">
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          onClearFilters={clearFilters}
          categoryDisplayNames={categoryDisplayNames}
        />
        <div className="flex-1">
          <CategoryAlert
            selectedCategories={selectedCategories}
            categoryDisplayNames={categoryDisplayNames}
            onClearCategories={clearCategories}
          />
          <ProductGrid products={products} onProductClick={handleProductClick} />
        </div>
      </div>
      <MobileFilters showFilters={showFilters} onClose={() => setShowFilters(false)} filters={filters} setFilters={setFilters} productsCount={products.length} />
      <SortModal showSortModal={showSortModal} onClose={() => setShowSortModal(false)} sortBy={sortBy} setSortBy={setSortBy} />
    </div>
  );
};

const LoadingPlaceholder = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 w-48 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorView = ({ error, retry }: { error: string, retry: () => void }) => (
  <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600">
    <p>{error}</p>
    <button onClick={retry} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">Retry</button>
  </div>
);

const Breadcrumb = ({ category }: { category: string }) => (
  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
    <a href="/" className="hover:text-teal-600">Главная</a>
    <span>/</span>
    <a href="/products" className="hover:text-teal-600">Все линейки</a>
    <span>/</span>
    <span className="text-gray-900">{category}</span>
  </div>
);

export default ProductsPage;