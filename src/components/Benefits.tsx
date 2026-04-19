// src/components/Benefits.tsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import BenefitCard from './benefits/BenefitCard';
import type { HomeBenefitBlock } from '../lib/types';

/** Matches previous hardcoded cards when API returns nothing or fails. */
const STATIC_FALLBACK: HomeBenefitBlock[] = [
  {
    id: 'fallback-0',
    image_url: '/images/review.png',
    title: 'Более 1000+',
    subtitle: 'положительных отзывов',
    body:
      'Тысячи счастливых историй — тысячи спокойных ночей. Люди доверяют Sakina свой сон — и остаются влюблены в комфорт.',
    link_url: null,
    order_index: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'fallback-1',
    image_url: '/images/waranty.png',
    title: 'Гарантия - 8 лет,',
    subtitle: 'но прослужить более 20 лет',
    body:
      'Матрас, который заботится о вас долгие годы. Мы уверены в своём качестве и готовы отвечать за него.',
    link_url: null,
    order_index: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'fallback-2',
    image_url: '/images/delivery.png',
    title: 'Быстрая доставка',
    subtitle: 'в день заказа',
    body:
      'Комфорт не должен ждать. Вы выбираете — мы доставляем уже сегодня, чтобы этой ночью вы спали лучше.',
    link_url: null,
    order_index: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'fallback-3',
    image_url: '/images/labratory.png',
    title: 'Мировые стандарты производства',
    subtitle: 'для контроля качества',
    body:
      'Наши матрасы производятся в самых инновационных и технологичных фабриках',
    link_url: null,
    order_index: 3,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

interface BenefitsProps {
  initialBlocks?: HomeBenefitBlock[];
}

const Benefits: React.FC<BenefitsProps> = ({ initialBlocks }) => {
  const blocks = useMemo(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      return [...initialBlocks].sort((a, b) => a.order_index - b.order_index);
    }
    return STATIC_FALLBACK;
  }, [initialBlocks]);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
    if (!container) return;
    container.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
    return () => container.removeEventListener('scroll', updateScrollProgress);
  }, [blocks]);

  return (
    <section aria-label="Преимущества" className="max-w-7xl mx-auto px-4 py-10 sm:py-12 md:py-16">
      {/* Tablet & desktop: grid + hover bubbles */}
      <div className="hidden md:grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
        {blocks.map((benefit) => (
          <div
            key={benefit.id}
            className="
              h-full w-full
              flex
              items-stretch
              justify-center text-center
              sm:justify-stretch sm:text-left
              lg:justify-center lg:text-center
            "
            onMouseEnter={() => setHoveredId(benefit.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="h-full w-full">
              <BenefitCard benefit={benefit} isHovered={hoveredId === benefit.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: horizontal scroll + progress (same pattern as CustomerReviews) */}
      <div className="md:hidden relative">
        <div
          ref={scrollContainerRef}
          className="
            flex gap-6 overflow-x-auto scrollbar-hide pb-4
            snap-x snap-mandatory scroll-smooth
            pl-[max(1rem,calc(50%-150px))] pr-[max(1rem,calc(50%-150px))]
          "
        >
          {blocks.map((benefit) => (
            <div key={benefit.id} className="flex-none w-[300px] snap-center snap-always">
              <BenefitCard benefit={benefit} isHovered={false} staticLayout />
            </div>
          ))}
        </div>

        <div className="h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-turquoise transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default Benefits;
