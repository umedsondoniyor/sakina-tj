import React, { useRef, useState, useEffect, useMemo } from 'react';
import { getLucideIconByName } from '../lib/navigationIcons';
import type { HomeFeatureBlock } from '../lib/types';

/** Matches previous hardcoded `Features` when API returns nothing or fails. */
const STATIC_FALLBACK: HomeFeatureBlock[] = [
  {
    id: 'fallback-0',
    icon_name: 'UserSearch',
    title: 'Индивидуальный',
    description: 'Персональный Подбор Матрас',
    order_index: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'fallback-1',
    icon_name: 'Award',
    title: 'Гарантия',
    description: 'Качества И Долговечности',
    order_index: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'fallback-2',
    icon_name: 'Store',
    title: 'Шоурум',
    description: 'В Центре Города',
    order_index: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'fallback-3',
    icon_name: 'Truck',
    title: 'Доставка',
    description: 'По Всему Таджикистану',
    order_index: 3,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'fallback-4',
    icon_name: 'FlaskRound',
    title: 'Экологически',
    description: 'Чистые И Гипоаллергенные Материалы',
    order_index: 4,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

function FeatureBlock({
  block,
  className,
}: {
  block: HomeFeatureBlock;
  className?: string;
}) {
  const Icon = getLucideIconByName(block.icon_name);
  return (
    <div className={className}>
      <div
        className="
          inline-flex items-center justify-center
          w-12 h-12 lg:w-14 lg:h-14
          rounded-full border border-gray-200
          shrink-0
        "
      >
        <Icon size={22} className="text-brand-turquoise" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base lg:text-lg text-brand-navy">{block.title}</h3>
        <p className="mt-1 text-sm text-gray-600 leading-snug">{block.description}</p>
      </div>
    </div>
  );
}

interface FeaturesProps {
  initialBlocks?: HomeFeatureBlock[];
}

const Features: React.FC<FeaturesProps> = ({ initialBlocks }) => {
  const blocks = useMemo(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      return [...initialBlocks].sort((a, b) => a.order_index - b.order_index);
    }
    return STATIC_FALLBACK;
  }, [initialBlocks]);

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
    <section aria-labelledby="features-heading" className="max-w-7xl mx-auto px-4 py-10 sm:py-12 md:py-16">
      <h2
        id="features-heading"
        className="text-xl md:text-2xl font-bold text-brand-navy mb-6 md:mb-8"
      >
        Преимущества
      </h2>

      {/* Desktop & tablet: grid */}
      <div className="hidden md:grid gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-5">
        {blocks.map((block) => (
          <FeatureBlock
            key={block.id}
            block={block}
            className="
              h-full
              flex flex-col items-center text-center
              sm:flex-row sm:items-center sm:text-left
              lg:flex-col lg:items-center lg:text-center
              gap-3 sm:gap-4
            "
          />
        ))}
      </div>

      {/* Mobile: centered card carousel */}
      <div className="md:hidden relative">
        <div
          ref={scrollContainerRef}
          className="
            flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide pb-4
            snap-x snap-mandatory scroll-smooth
            pl-[max(1rem,calc(50%-140px))] pr-[max(1rem,calc(50%-140px))]
          "
        >
          {blocks.map((block) => {
            const Icon = getLucideIconByName(block.icon_name);
            return (
              <div
                key={block.id}
                className="
                  flex-none w-[280px] snap-center snap-always
                  rounded-2xl border border-gray-200/90 bg-white shadow-md shadow-gray-200/50
                  px-6 py-7
                  flex flex-col items-center justify-center text-center gap-4
                  min-h-[200px]
                "
              >
                <div
                  className="
                    inline-flex items-center justify-center
                    w-14 h-14 rounded-full
                    border border-gray-200 bg-brand-turquoise/[0.06]
                  "
                >
                  <Icon size={24} className="text-brand-turquoise" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-brand-navy leading-tight">{block.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-snug">{block.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-0.5 bg-gray-100 mt-1 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-brand-turquoise transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
