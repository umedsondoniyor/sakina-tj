import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryItem from './category/CategoryItem';
import CategoryScrollControls from './category/CategoryScrollControls';
import SwipeHint from './category/SwipeHint';

const categories = [
  { id: 1, name: 'Матрасы', image: 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png', slug: 'mattresses' },
  { id: 2, name: 'Кровати', image: 'https://ik.imagekit.io/3js0rb3pk/categ_bed.png', slug: 'beds', link: '/products?category=beds' },
  { id: 3, name: 'Одеяло', image: 'https://ik.imagekit.io/3js0rb3pk/categ_blanket.png' },
  { id: 4, name: 'Массажное кресло', image: '/images/smart-chair-b.png', slug: 'massage-chairs' },
  { id: 5, name: 'Подушки', image: 'https://ik.imagekit.io/3js0rb3pk/categ_pillow.png', slug: 'pillows', link: '/products?category=pillows' },
  { id: 6, name: 'Деревянные 3D-карты', image: 'https://ik.imagekit.io/3js0rb3pk/categ_map.png', slug: 'world-maps', link: '/products?category=map' },
];

const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();

  // MOBILE rail refs/state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (!showSwipeHint) return;
    const t = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(t);
  }, [showSwipeHint]);

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = Math.max(0, scrollWidth - clientWidth);
    setScrollProgress(max ? (scrollLeft / max) * 100 : 0);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < max - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => el.removeEventListener('scroll', updateScroll);
  }, []);

  // drag scrolling (mobile)
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const startDrag = (clientX: number) => {
    setDragging(true);
    const left = scrollRef.current?.getBoundingClientRect().left ?? 0;
    setStartX(clientX - left);
  };
  const doDrag = (clientX: number) => {
    if (!dragging || !scrollRef.current) return;
    const left = scrollRef.current.getBoundingClientRect().left;
    const x = clientX - left;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft -= walk;
    setStartX(x);
  };
  const endDrag = () => setDragging(false);

  const handleCategoryClick = (category: typeof categories[number], e: React.MouseEvent) => {
    e.preventDefault();
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (category.slug === 'mattresses') {
      navigate('/mattresses');
    } else if (category.link) {
      navigate(category.link);
    } else {
      navigate(`/products?category=${category.slug}`, {
        replace: true,
        state: { selectedCategories: [category.slug], immediate: true },
      });
    }
  };

  const scrollBy = (left: number) => scrollRef.current?.scrollBy({ left, behavior: 'smooth' });

  return (
    <section aria-label="Категории" className="relative max-w-7xl mx-auto px-4 py-4">
      {/* MOBILE: two-row horizontal rail with controls and progress */}
      <div className="md:hidden relative">
        <CategoryScrollControls
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onScrollLeft={() => scrollBy(-220)}
          onScrollRight={() => scrollBy(220)}
        />

        <div
          ref={scrollRef}
          className="
            relative
            overflow-x-auto scrollbar-hide
            -mx-4 px-4  /* edge-to-edge on mobile only */
          "
          onMouseDown={(e) => startDrag(e.pageX)}
          onMouseMove={(e) => doDrag(e.pageX)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => {
            setShowSwipeHint(false);
            startDrag(e.touches[0].pageX);
          }}
          onTouchMove={(e) => doDrag(e.touches[0].pageX)}
          onTouchEnd={endDrag}
        >
          <SwipeHint showSwipeHint={showSwipeHint} />

          <div
            className="justify-center
              grid grid-rows-2 grid-flow-col gap-x-8 md:gap-x-4 gap-y-4
              auto-cols-[130px] sm:auto-cols-[150px]
              min-w-max
              snap-x snap-mandatory
              py-1
            "
          >
            {categories.map((category) => (
              <div key={category.id} className="snap-start">
                <CategoryItem category={category} onCategoryClick={handleCategoryClick} />
              </div>
            ))}
          </div>
        </div>

        <div className="h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-turquoise transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* DESKTOP/TABLET: full-width wrapping grid (no scroller wrapper) */}
      <div className="hidden md:block">
        <div className="grid gap-6 md:gap-8 grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onCategoryClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
