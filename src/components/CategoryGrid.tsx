import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryItem from './category/CategoryItem';
import CategoryScrollControls from './category/CategoryScrollControls';
import SwipeHint from './category/SwipeHint';
import { getHomeCategoryGridItems } from '../lib/api';
import type { NavigationItem } from '../lib/types';

type CategoryTile = {
  id: string | number;
  name: string;
  image: string;
  slug: string;
  link?: string;
};

const FALLBACK_CATEGORIES: CategoryTile[] = [
  { id: 1, name: 'Матрасы', image: 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png', slug: 'mattresses', link: '/categories/mattresses' },
  { id: 2, name: 'Кровати', image: 'https://ik.imagekit.io/3js0rb3pk/categ_bed.png', slug: 'beds', link: '/categories/beds' },
  { id: 3, name: 'Одеяло', image: 'https://ik.imagekit.io/3js0rb3pk/categ_blanket.png', slug: 'blankets' },
  { id: 4, name: 'Массажное кресло', image: '/images/smart-chair-b.png', slug: 'smartchair', link: '/categories/smartchair' },
  { id: 5, name: 'Подушки', image: 'https://ik.imagekit.io/3js0rb3pk/categ_pillow.png', slug: 'pillows', link: '/categories/pillows' },
  { id: 6, name: 'Деревянные 3D-карты', image: 'https://ik.imagekit.io/3js0rb3pk/categ_map.png', slug: 'world-maps', link: '/categories/map' },
];

function mapHomeGridRows(rows: NavigationItem[]): CategoryTile[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.title,
    image: row.icon_image_url || '',
    slug: row.category_slug,
    link: row.link_url || undefined,
  }));
}

const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryTile[]>(FALLBACK_CATEGORIES);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getHomeCategoryGridItems();
        const valid = rows.filter((r) => r.icon_image_url?.trim());
        if (cancelled || valid.length === 0) return;
        setCategories(mapHomeGridRows(valid));
      } catch (e) {
        console.error('CategoryGrid: failed to load home category tiles', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [categories]);

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

  const handleCategoryClick = (category: CategoryTile, e: React.MouseEvent) => {
    e.preventDefault();
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (category.link) {
      navigate(category.link);
    } else {
      navigate(`/categories/${category.slug}`);
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
            relative flex justify-center
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
            className="
              grid grid-rows-2 grid-flow-col justify-items-center
              gap-x-10 sm:gap-x-12 gap-y-4
              auto-cols-[minmax(120px,140px)] sm:auto-cols-[minmax(130px,150px)]
              w-max max-w-none mx-auto
              snap-x snap-mandatory
              py-1
            "
          >
            {categories.map((category, index) => (
              <div key={category.id} className="snap-start w-full max-w-[150px]">
                <CategoryItem category={category} onCategoryClick={handleCategoryClick} index={index} />
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

      {/* DESKTOP/TABLET: centered wrapping row(s); works for any number of tiles */}
      <div className="hidden md:flex md:flex-wrap md:justify-center md:items-start md:gap-x-6 md:gap-y-6 lg:gap-x-8 lg:gap-y-6">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="shrink-0 w-[140px] md:w-[145px] lg:w-[150px]"
          >
            <CategoryItem
              category={category}
              onCategoryClick={handleCategoryClick}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
