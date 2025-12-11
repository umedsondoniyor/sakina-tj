import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { getProducts } from '../lib/api';
import type { Product } from '../lib/types';
import { formatCurrency } from '../lib/utils';

const CARD_WIDTH_MOBILE = 280; // px
const SCROLL_STEP = 320;       // px per click (approx one card + gap)

const RecommendedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await getProducts();
        // TODO: replace with real recommendations logic
        setProducts(all.slice(0, 10));
        setError(null);
      } catch (err: any) {
        if (err?.message?.includes('No products available')) {
          setError('No products available at the moment');
        } else {
          setError('Failed to load recommended products');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = Math.max(0, scrollWidth - clientWidth);
    setScrollProgress(max ? (scrollLeft / max) * 100 : 0);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState, products.length]);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') scrollBy(-SCROLL_STEP);
    if (e.key === 'ArrowRight') scrollBy(SCROLL_STEP);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="w-full aspect-square bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{error}</h3>
          <p className="mt-1 text-sm text-gray-600">Проверьте позже для новых товаров.</p>
          <button
            onClick={() => location.reload()}
            className="mt-4 px-4 py-2 bg-brand-turquoise text-white rounded hover:bg-brand-navy font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Товары недоступны</h3>
          <p className="mt-1 text-sm text-gray-600">Проверьте позже для новых товаров.</p>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Рекомендованные товары" className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold">Вас может заинтересовать</h2>

        {/* Desktop controls (show on hover/focus) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollBy(-SCROLL_STEP)}
            disabled={!canScrollLeft}
            className={`
              p-2 rounded-full transition
              ${canScrollLeft ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}
            `}
            aria-label="Предыдущие"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scrollBy(SCROLL_STEP)}
            disabled={!canScrollRight}
            className={`
              p-2 rounded-full transition
              ${canScrollRight ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}
            `}
            aria-label="Следующие"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* One scroller for all sizes */}
      <div
        className="group relative"
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-roledescription="carousel"
      >
        {/* hover-reveal overlay controls for md+ */}
        <button
          type="button"
          onClick={() => scrollBy(-SCROLL_STEP)}
          disabled={!canScrollLeft}
          aria-label="Предыдущие товары"
          className="
            hidden md:flex items-center justify-center
            absolute left-2 top-1/2 -translate-y-1/2 z-10
            p-2 rounded-full bg-white/80 backdrop-blur shadow
            hover:bg-white transition
            opacity-0 group-hover:opacity-100 focus:opacity-100
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          onClick={() => scrollBy(SCROLL_STEP)}
          disabled={!canScrollRight}
          aria-label="Следующие товары"
          className="
            hidden md:flex items-center justify-center
            absolute right-2 top-1/2 -translate-y-1/2 z-10
            p-2 rounded-full bg-white/80 backdrop-blur shadow
            hover:bg-white transition
            opacity-0 group-hover:opacity-100 focus:opacity-100
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <ChevronRight size={22} />
        </button>

        {/* Horizontal track (snap on mobile, free scroll on desktop) */}
        <div
          ref={scrollRef}
          className="
            overflow-x-auto scrollbar-hide -mx-4 px-4
            snap-x snap-mandatory md:snap-none
          "
        >
          <div className="flex gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="
                  flex-none w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px]
                  snap-start
                "
              >
                <div className="relative mb-3 md:mb-4">
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      decoding="async"
                      width="320"
                      height="320"
                    />
                  </div>
                  {product.sale_percentage && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm">
                      -{product.sale_percentage}%
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs md:text-sm text-gray-600 mb-1.5 md:mb-2">
                    {product.review_count} оценок
                  </div>
                  <h3 className="text-sm md:text-base font-medium mb-1.5 md:mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.weight_category && (
                    <p className="text-xs text-gray-700 mb-2">
                      {product.weight_category}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base md:text-lg font-bold">
                      {formatCurrency(product.price)}
                    </span>
                    {product.old_price && product.old_price > 0 && (
                      <span className="text-sm text-gray-600 line-through">
                        {formatCurrency(product.old_price)}
                      </span>
                    )}
                  </div>
                  <button className="w-full bg-brand-turquoise text-white py-2 rounded hover:bg-brand-navy transition-colors font-semibold">
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-turquoise transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts;
