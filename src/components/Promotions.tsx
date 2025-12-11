import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PromotionCard from './promotions/PromotionCard';
import MobilePromotionCard from './promotions/MobilePromotionCard';

interface Promotion {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  image: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: 'Экономия в больших масштабах!',
    subtitle: 'Скидки на матрасы',
    discount: 'до -90%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Диваны для сна и отдыха',
    subtitle: 'Скидки на любимые модели',
    discount: 'до -70%',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Анатомические подушки',
    subtitle: 'Для быстрого засыпания и волшебных снов',
    discount: 'до -80%',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'Погрузись в мир комфорта и уюта',
    subtitle: 'Скидки на постельное белье',
    discount: 'до -50%',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80'
  }
];

const Promotions = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const updateScrollProgress = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollProgress);
      updateScrollProgress();
      return () => container.removeEventListener('scroll', updateScrollProgress);
    }
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center space-x-3">
          <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            #ЯВШОКЕ!
          </span>
          <h2 className="text-xl md:text-2xl font-bold">Акции</h2>
        </div>
        <div className="hidden md:flex space-x-2">
          <button
            onClick={goToPrev}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-4 gap-6">
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4"
        >
          <div className="flex space-x-4">
            {promotions.map((promo) => (
              <MobilePromotionCard key={promo.id} promo={promo} />
            ))}
          </div>
        </div>
        {/* Mobile Progress Bar */}
        <div className="h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-turquoise transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Promotions;