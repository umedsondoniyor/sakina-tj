import React, { useState, useEffect, useMemo } from 'react';
import { getProducts } from '../lib/api';
import type { Product } from '../lib/types';
import { Star, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

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

  function getPageTitle() {
    if (filters.age.length > 0) {
      const ageRange = filters.age[0];
      switch (ageRange) {
        case 'from0to3':
          return 'Детские матрасы от 0 до 3 лет';
        case 'from3to7':
          return 'Детские матрасы от 3 до 7 лет';
        case 'from7to14':
          return 'Детские матрасы от 7 до 14 лет';
        default:
          return 'Детские матрасы';
      }
    }
    return 'Матрасы';
  }

  const sortOptions = [
    { value: 'popularity', label: 'По популярности' },
    { value: 'price-desc', label: 'По убыванию цены' },
    { value: 'price-asc', label: 'По возрастанию цены' },
    { value: 'in-stock', label: 'По наличию' },
    { value: 'discount', label: 'По скидке' },
    { value: 'new', label: 'По новизне' },
    { value: 'rating', label: 'По рейтингу' },
    { value: 'reviews', label: 'По количеству отзывов' },
    { value: 'promo', label: 'Акция' }
  ];

  useEffect(() => {
    loadProductsByCategories();
  }, [selectedCategories, filters, sortBy]);

  // Initialize selected categories from URL parameter
  useEffect(() => {
    if (currentCategory) {
      setSelectedCategories([currentCategory]);
    }
  }, [currentCategory]);

  const loadProductsByCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('products').select('*');
      
      // Apply category filter using OR logic for multiple selections
      if (selectedCategories.length > 0) {
        // Build OR condition for multiple categories
        const categoryFilter = selectedCategories.map(cat => `category.eq.${cat}`).join(',');
        query = query.or(categoryFilter);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please check your connection and try again.');
        return;
      }

      // Validate response
      if (!data) {
        console.warn('No data returned from Supabase query');
        setProducts([]);
        return;
      }

      // Handle empty result sets
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
        // Add category if not already selected
        newSelectedCategories = selectedCategories.includes(categoryValue) 
          ? selectedCategories 
          : [...selectedCategories, categoryValue];
      } else {
        // Remove category from selection
        newSelectedCategories = selectedCategories.filter(cat => cat !== categoryValue);
      }
      
      setSelectedCategories(newSelectedCategories);
      
      // Update URL to reflect current selection
      if (newSelectedCategories.length === 1) {
        // Single category selected - update URL
        navigate(`/products?category=${newSelectedCategories[0]}`, { replace: true });
      } else if (newSelectedCategories.length === 0) {
        // No categories selected - show all products
        navigate('/products', { replace: true });
      } else {
        // Multiple categories - keep current URL but don't navigate
        // This maintains the filter state without changing the URL
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
      <div className="relative mb-6">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-3 min-w-max">
            <button className="flex-none px-4 py-2 bg-yellow-100 rounded-full text-sm whitespace-nowrap">
              Онлайн-подбор матраса
            </button>
            <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
              Матрас 160×200
            </button>
            <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
              Матрас 180×200
            </button>
            <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
              Матрас 140×200
            </button>
            <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
              Матрас 90×200
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter/Sort Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-t border-b">
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center space-x-2 text-gray-700"
        >
          <SlidersHorizontal size={20} />
          <span>Фильтр</span>
        </button>
        
        <button
          onClick={() => setShowSortModal(true)}
          className="flex items-center space-x-2 text-gray-700"
        >
          <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
          <ChevronDown size={20} />
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters - Desktop */}
        <div className="hidden md:block bg-gray-50 p-4 rounded-lg border-2 w-64 flex-shrink-0 border-gray-200 pr-8">
          <div className="space-y-6">
            {/* Category Selection - Prominent at top */}
            <div className="bg-gray-50 border-gray-200">
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Выберите категорию</h3>
              <div className="space-y-2">
                {Object.entries(categoryDisplayNames).map(([value, label]) => (
                  <label key={value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(value)}
                      onChange={(e) => handleCategoryChange(value, e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className={selectedCategories.includes(value) ? 'font-medium text-teal-600' : ''}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* Age */}
            <div>
              <h3 className="font-medium mb-3">Возраст</h3>
              <div className="space-y-2">
                {[
                  { value: 'from0to3', label: '0-3 года' },
                  { value: 'from3to7', label: '3-7 лет' },
                  { value: 'from7to14', label: '7-14 лет' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.age.includes(option.value)}
                      onChange={(e) => {
                        const newAges = e.target.checked
                          ? [...filters.age, option.value]
                          : filters.age.filter(a => a !== option.value);
                        setFilters({ ...filters, age: newAges });
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-medium mb-3">Наличие</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Только в наличии</span>
              </label>
            </div>


            {/* Hardness */}
            <div>
              <h3 className="font-medium mb-3">Жесткость</h3>
              <div className="space-y-2">
                {['Жесткий', 'Средняя', 'Мягкий', 'Разная жесткость сторон'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.hardness.includes(option)}
                      onChange={(e) => {
                        const newHardness = e.target.checked
                          ? [...filters.hardness, option]
                          : filters.hardness.filter(h => h !== option);
                        setFilters({ ...filters, hardness: newHardness });
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Width */}
            <div>
              <h3 className="font-medium mb-3">Ширина, см</h3>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="от"
                  className="w-20 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="до"
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>
            </div>

            {/* Length */}
            <div>
              <h3 className="font-medium mb-3">Длина, см</h3>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="от"
                  className="w-20 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="до"
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>
            </div>

            {/* Height */}
            <div>
              <h3 className="font-medium mb-3">Высота, см</h3>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="от"
                  className="w-20 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="до"
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-medium mb-3">Цена,  c.</h3>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="от"
                  className="w-20 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="до"
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>
            </div>

            {/* Mattress Type */}
            <div>
              <h3 className="font-medium mb-3">Вид матраса</h3>
              <div className="space-y-2">
                {['Беспружинный', 'Независимый пружинный блок', 'В скрутке'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.mattressType.includes(option)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.mattressType, option]
                          : filters.mattressType.filter(t => t !== option);
                        setFilters({ ...filters, mattressType: newTypes });
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="font-medium mb-3">Предпочтения</h3>
              <div className="space-y-2">
                {['Для искривления Ergomotion', 'Для детей и подростков', 'Натуральные материалы'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.preferences.includes(option)}
                      onChange={(e) => {
                        const newPrefs = e.target.checked
                          ? [...filters.preferences, option]
                          : filters.preferences.filter(p => p !== option);
                        setFilters({ ...filters, preferences: newPrefs });
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Functions */}
            <div>
              <h3 className="font-medium mb-3">Функция</h3>
              <div className="space-y-2">
                {['Защищает спальное место', 'Улучшает жесткость'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.functions.includes(option)}
                      onChange={(e) => {
                        const newFuncs = e.target.checked
                          ? [...filters.functions, option]
                          : filters.functions.filter(f => f !== option);
                        setFilters({ ...filters, functions: newFuncs });
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="text-teal-600 hover:text-teal-700"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {selectedCategories.length > 0 && (
            <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-teal-700">
                  Показаны товары из категорий: {selectedCategories.map(cat => categoryDisplayNames[cat]).join(', ')}
                </span>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    navigate('/products', { replace: true });
                  }}
                  className="text-sm text-teal-600 hover:text-teal-800 underline"
                >
                  Сбросить
                </button>
              </div>
            </div>
          )}
          
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {selectedCategories.length > 0 
                  ? 'Товары в выбранных категориях не найдены'
                  : 'Товары не найдены'
                }
              </div>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  navigate('/products', { replace: true });
                }}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              >
                Показать все товары
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="relative mb-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {product.sale_percentage && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      -{product.sale_percentage}%
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">{product.review_count}</span>
                  </div>
                  <h3 className="font-medium mb-2 group-hover:text-teal-600 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{product.price.toLocaleString()}  c.</span>
                    {product.old_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.old_price.toLocaleString()}  c.
                      </span>
                    )}
                  </div>
                  <button className="w-full mt-4 bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition-colors">
                    В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Фильтры</h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              <div className="p-4 space-y-6">
                {/* Age filters */}
                <div>
                  <h3 className="font-medium mb-3">Возраст</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'from0to3', label: '0-3 года' },
                      { value: 'from3to7', label: '3-5 лет' },
                      { value: 'from7to14', label: '5-7 лет' },
                      { value: 'from7to14', label: '7-14 лет' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.age.includes(option.value)}
                          onChange={(e) => {
                            const newAges = e.target.checked
                              ? [...filters.age, option.value]
                              : filters.age.filter(a => a !== option.value);
                            setFilters({ ...filters, age: newAges });
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Other mobile filters */}
                <div>
                  <h3 className="font-medium mb-3">Жесткость</h3>
                  <div className="space-y-2">
                    {['Жесткий', 'Средняя', 'Мягкий', 'Разная жесткость сторон'].map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.hardness.includes(option)}
                          onChange={(e) => {
                            const newHardness = e.target.checked
                              ? [...filters.hardness, option]
                              : filters.hardness.filter(h => h !== option);
                            setFilters({ ...filters, hardness: newHardness });
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Add other filter sections similarly */}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              <button 
                className="w-full bg-teal-500 text-white py-3 rounded-lg"
                onClick={() => setShowFilters(false)}
              >
                Показать {products.length} товаров
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowSortModal(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Сортировка</h2>
              <button onClick={() => setShowSortModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="py-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full px-4 py-3 text-left ${
                    sortBy === option.value ? 'text-teal-600' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                >
                  {option.label}
                  {sortBy === option.value && (
                    <span className="float-right text-teal-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;