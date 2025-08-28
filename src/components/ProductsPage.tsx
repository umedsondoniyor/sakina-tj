import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, PackageOpen } from 'lucide-react';
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

const categoryDisplayNames = {
  'mattresses': 'Матрасы',
  'beds': 'Кровати', 
  'smartchair': 'Массажные кресла',
  'map': 'Карты',
  'pillows': 'Подушки',
  'blankets': 'Одеяла',
  'furniture': 'Мебель'
};

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize state immediately from navigation
  const getInitialCategories = () => {
    // Check navigation state first (from navbar clicks)
    if (location.state?.selectedCategories) {
      return location.state.selectedCategories;
    }
    // Then check URL params (from direct links)
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      return [categoryParam];
    }
    return [];
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(getInitialCategories());
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  
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
    weightCategory: []
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Handle navigation state changes
  useEffect(() => {
    const newCategories = getInitialCategories();
    if (newCategories.length > 0 && JSON.stringify(newCategories) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(newCategories);
      setFilters(prev => ({
        ...prev,
        productType: newCategories
      }));
    }
  }, [location.state, searchParams]);

  // Apply filters whenever products, filters, or selected categories change
  useEffect(() => {
    applyFilters();
  }, [products, filters, selectedCategories]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }

    // Apply other filters
    if (filters.hardness.length > 0) {
      filtered = filtered.filter(product => 
        product.hardness && filters.hardness.includes(product.hardness)
      );
    }

    if (filters.weightCategory.length > 0) {
      filtered = filtered.filter(product => 
        product.weight_category && filters.weightCategory.includes(product.weight_category)
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter(product => 
        product.variants?.some(variant => variant.inventory?.in_stock) ?? true
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'new':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        // popularity - sort by review count and rating
        filtered.sort((a, b) => (b.review_count * b.rating) - (a.review_count * a.rating));
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (categoryValue: string, isChecked: boolean) => {
    const newCategories = isChecked
      ? [...selectedCategories, categoryValue]
      : selectedCategories.filter(cat => cat !== categoryValue);
    
    setSelectedCategories(newCategories);
    setFilters(prev => ({
      ...prev,
      productType: newCategories
    }));
  };

  const clearFilters = () => {
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
      weightCategory: []
    });
    setSelectedCategories([]);
  };

  const clearCategories = () => {
    setSelectedCategories([]);
    setFilters(prev => ({
      ...prev,
      productType: []
    }));
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="flex gap-8">
              <div className="w-64 space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
            onClick={loadProducts}
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategories.length === 1 
              ? categoryDisplayNames[selectedCategories[0]] || 'Товары'
              : 'Все товары'
            }
          </h1>
          <p className="text-gray-600">
            {selectedCategories.length === 1 
              ? `Найдено ${filteredProducts.length} товаров в категории "${categoryDisplayNames[selectedCategories[0]]}"`
              : `Найдено ${filteredProducts.length} товаров`
            }
          </p>
        </div>

        {/* Category Alert */}
        <CategoryAlert
          selectedCategories={selectedCategories}
          categoryDisplayNames={categoryDisplayNames}
          onClearCategories={clearCategories}
        />

        {/* Quick Filters */}
        <QuickFilters />

        {/* Mobile Filter Bar */}
        <MobileFilterBar
          onShowFilters={() => setShowFilters(true)}
          onShowSort={() => setShowSortModal(true)}
          sortBy={sortBy}
        />

        {/* Main Content */}
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

          {/* Products Grid */}
          <div className="flex-1">
            {/* Desktop Sort */}
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
          </div>
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