import React, { useState, useEffect, useMemo } from 'react';
import { getProducts } from '../lib/api';
import type { Product } from '../lib/types';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Import subcomponents
import ProductFilters from './products/ProductFilters';
import MobileFilters from './products/MobileFilters';
import SortModal from './products/SortModal';
import ProductGrid from './products/ProductGrid';
import QuickFilters from './products/QuickFilters';
import MobileFilterBar from './products/MobileFilterBar';
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
}

interface LocationState {
  filters: FilterState;
  selections: Record<string, string>;
}

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters: initialFilters, selections } = (location.state as LocationState) || { filters: {}, selections: {} };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    age: getInitialAgeFilter(selections),
    hardness: [],
    width: initialFilters?.width || [],
    length: initialFilters?.length || [],
    height: initialFilters?.height || [],
    price: initialFilters?.price || [],
    inStock: initialFilters?.inStock || false,
    productType: [searchParams.get('category') || 'mattress'],
    mattressType: initialFilters?.mattressType || [],
    preferences: initialFilters?.preferences || [],
    functions: initialFilters?.functions || []
  });

  const [sortBy, setSortBy] = useState('popularity');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Category mapping for display names
  const categoryDisplayNames: Record<string, string> = {
    mattresses: 'Матрасы',
    beds: 'Кровати',
    smartchair: 'Массажные кресла',
    map: 'Карта',
    pillows: 'Подушки',
    blankets: 'Одеяла',
    furniture: 'Мебель',
  };

  // Get current category from URL params
  const currentCategory = searchParams.get('category') || '';

  // Get display name for current category
  const categoryDisplayName = useMemo(() => {
    return categoryDisplayNames[currentCategory] || categoryDisplayNames[currentCategory === 'mattresses' ? 'mattresses' : ''] || 'Все товары';
  }, [currentCategory]);

  function getInitialAgeFilter(selections: Record<string, string>) {
    if (selections.boy_age) return [selections.boy_age];
    if (selections.girl_age) return [selections.girl_age];
    return [];
  }

  useEffect(() => {
    loadProductsByCategories();
  }, [selectedCategories, filters, sortBy]);

  // Initialize selected categories from URL parameter
  useEffect(() => {
    if (currentCategory) {
      setSelectedCategories([currentCategory]);
    }
    
    // Handle navigation from header with state
    if (location.state?.selectedCategories) {
      setSelectedCategories(location.state.selectedCategories);
      // Clear the state to prevent it from persisting
      navigate(location.pathname + location.search, { 
        replace: true, 
        state: null 
      });
    }
  }, [currentCategory]);

  const loadProductsByCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('products').select('*');
      
      // Apply category filter using IN for multiple selections
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please check your connection and try again.');
        return;
      }

      if (!data) {
        console.warn('No data returned from Supabase query');
        setProducts([]);
        return;
      }

      if (data.length === 0) {
        console.log('No products found for selected categories:', selectedCategories);
        setProducts([]);
        return;
      }

      let filtered = data;
      
      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          filtered = filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered = filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered = filtered.sort((a, b) => b.rating - a.rating);
          break;
        default: // popularity
          filtered = filtered.sort((a, b) => b.review_count - a.review_count);
      }

      setProducts(filtered);
      console.log(`Loaded ${filtered.length} products for categories:`, selectedCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Database connection error:', errorMessage);
      setError(`Database error: ${errorMessage}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryValue: string, isChecked: boolean) => {
    try {
      let newSelectedCategories: string[];
      
      if (isChecked) {
        newSelectedCategories = selectedCategories.includes(categoryValue) 
          ? selectedCategories 
          : [...selectedCategories, categoryValue];
      } else {
        newSelectedCategories = selectedCategories.filter(cat => cat !== categoryValue);
      }
      
      setSelectedCategories(newSelectedCategories);
      
      // Update URL to reflect current selection
      if (newSelectedCategories.length === 1) {
        navigate(`/products?category=${newSelectedCategories[0]}`, { replace: true });
      } else if (newSelectedCategories.length === 0) {
        navigate('/products', { replace: true });
      }
      
      console.log('Category selection updated:', newSelectedCategories);
    } catch (error) {
      console.error('Error handling category change:', error);
      setError('Failed to update category filter');
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
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
      functions: []
    });
    navigate('/products', { replace: true });
  };

  const clearCategories = () => {
    setSelectedCategories([]);
    navigate('/products', { replace: true });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
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
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadProductsByCategories}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-teal-600">Главная</a>
        <span>/</span>
        <a href="/products" className="hover:text-teal-600">Все линейки</a>
        <span>/</span>
        <span className="text-gray-900">{categoryDisplayName}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{categoryDisplayName}</h1>
      </div>

      {/* Quick Filters */}
      <QuickFilters />

      {/* Mobile Filter/Sort Bar */}
      <MobileFilterBar
        onShowFilters={() => setShowFilters(true)}
        onShowSort={() => setShowSortModal(true)}
        sortBy={sortBy}
      />

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          onClearFilters={clearFilters}
          categoryDisplayNames={categoryDisplayNames}
        />

        {/* Product Grid */}
        <div className="flex-1">
          <CategoryAlert
            selectedCategories={selectedCategories}
            categoryDisplayNames={categoryDisplayNames}
            onClearCategories={clearCategories}
          />
          
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
          />
        </div>
      </div>

      {/* Mobile Modals */}
      <MobileFilters
        showFilters={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        productsCount={products.length}
      />

      <SortModal
        showSortModal={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </div>
  );
};

export default ProductsPage;