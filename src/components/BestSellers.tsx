import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBestSellers } from '../lib/api';
import type { Product } from '../lib/types';
import { formatCurrency } from '../lib/utils';

const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 🔹 Fetch data
  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        setLoading(true);
        const data = await getBestSellers();
        setProducts(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('No products available')) {
          setError('На данный момент хитов продаж нет');
        } else {
          setError('Не удалось загрузить хиты продаж');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBestSellers();
  }, []);

  // 🔹 Scroll state update
  const updateScrollProgress = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;

    setScrollProgress(progress);
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < maxScroll - 5);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollProgress);
      updateScrollProgress();
      return () => container.removeEventListener('scroll', updateScrollProgress);
    }
  }, []);

  // 🔹 Recalculate scroll after products load
  useEffect(() => {
    if (products.length > 0) {
      setTimeout(updateScrollProgress, 200);
    }
  }, [products]);

  const goToPrev = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(updateScrollProgress, 200);
    }
  };

  const goToNext = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(updateScrollProgress, 200);
    }
  };

  // 🔹 Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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

  // 🔹 Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{error}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Попробуйте позже или обновите страницу.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Empty state
  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Хиты продаж отсутствуют
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Загляните позже — возможно появятся новые популярные модели.
          </p>
        </div>
      </div>
    );
  }

  // 🔹 Main render
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold">Хиты продаж</h2>

        {/* Navigation arrows (desktop) */}
        <div className="hidden md:flex space-x-2">
          <button
            onClick={goToPrev}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition-colors ${
              canScrollLeft
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition-colors ${
              canScrollRight
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group">
            <div className="relative mb-4 overflow-hidden rounded-lg">
              <img
                loading="lazy"
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
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
                      className={
                        i < product.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {product.review_count}
                </span>
              </div>

              <h3 className="font-medium mb-2 group-hover:text-teal-600 line-clamp-2">
                {product.name}
              </h3>
              {product.weight_category && (
                <p className="text-sm text-gray-600 mb-2">
                  {product.weight_category}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">
                  {formatCurrency(product.price)}
                </span>
                {product.old_price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.old_price)}
                  </span>
                )}
              </div>

              <button
                onClick={() => navigate(`/products/${product.id}`)}
                className="w-full mt-4 bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition-colors"
              >
                Подробнее
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4"
        >
          <div className="flex space-x-4">
            {products.map((product) => (
              <div key={product.id} className="flex-none w-[280px]">
                <div className="relative mb-3 overflow-hidden rounded-lg">
                  <img
                    loading="lazy"
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {product.sale_percentage && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm">
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
                          size={14}
                          className={
                            i < product.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {product.review_count}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.weight_category && (
                    <p className="text-xs text-gray-600 mb-2">
                      {product.weight_category}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-base font-bold">
                      {formatCurrency(product.price)}
                    </span>
                    {product.old_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.old_price)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="w-full bg-teal-500 text-white py-2 rounded text-sm hover:bg-teal-600 transition-colors"
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BestSellers;
