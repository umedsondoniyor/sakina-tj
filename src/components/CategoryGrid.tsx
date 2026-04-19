import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryItem from './category/CategoryItem';
import CategoryScrollControls from './category/CategoryScrollControls';
import SwipeHint from './category/SwipeHint';
import {
  FALLBACK_CATEGORIES,
  mapHomeGridRows,
  chunkCategoryColumns,
  type CategoryTile,
} from './category/categoryGridData';
import { useCategoryGridMobileRail, CATEGORY_SCROLL_NUDGE_PX } from './category/useCategoryGridMobileRail';
import { getHomeCategoryGridItems } from '../lib/api';

const MOBILE_SCROLL_RAIL_CLASS =
  'relative flex justify-start overflow-x-auto overflow-y-hidden scrollbar-hide overscroll-x-contain touch-pan-x scroll-px-4 snap-x snap-mandatory';

const MOBILE_COLUMN_CLASS =
  'snap-center flex flex-col gap-y-3 sm:gap-y-4 items-center w-[104px] sm:w-[118px] shrink-0';

type ClickHandler = (category: CategoryTile, e: React.MouseEvent) => void;

function CategoryGridDesktop({
  categories,
  onCategoryClick,
}: {
  categories: CategoryTile[];
  onCategoryClick: ClickHandler;
}) {
  return (
    <div className="hidden md:flex md:flex-wrap md:justify-center md:items-start md:gap-x-6 md:gap-y-6 lg:gap-x-8 lg:gap-y-6">
      {categories.map((category, index) => (
        <div key={category.id} className="shrink-0 w-[140px] md:w-[145px] lg:w-[150px]">
          <CategoryItem category={category} onCategoryClick={onCategoryClick} index={index} />
        </div>
      ))}
    </div>
  );
}

function CategoryGridMobile({
  categories,
  onCategoryClick,
}: {
  categories: CategoryTile[];
  onCategoryClick: ClickHandler;
}) {
  const columns = chunkCategoryColumns(categories);
  const rail = useCategoryGridMobileRail(categories.length);

  return (
    <div className="md:hidden relative">
      <CategoryScrollControls
        canScrollLeft={rail.canScrollLeft}
        canScrollRight={rail.canScrollRight}
        onScrollLeft={() => rail.scrollBy(-CATEGORY_SCROLL_NUDGE_PX)}
        onScrollRight={() => rail.scrollBy(CATEGORY_SCROLL_NUDGE_PX)}
      />

      <div
        ref={rail.scrollRef}
        className={MOBILE_SCROLL_RAIL_CLASS}
        onMouseDown={(e) => rail.startDrag(e.pageX)}
        onMouseMove={(e) => rail.doDrag(e.pageX)}
        onMouseUp={rail.endDrag}
        onMouseLeave={rail.endDrag}
        onTouchStart={(e) => {
          rail.dismissSwipeHint();
          rail.startDrag(e.touches[0].pageX);
        }}
        onTouchMove={(e) => rail.doDrag(e.touches[0].pageX)}
        onTouchEnd={rail.endDrag}
      >
        <SwipeHint showSwipeHint={rail.showSwipeHint} />

        <div className="flex flex-row gap-x-5 sm:gap-x-6 w-max shrink-0 py-1">
          {columns.map((col, colIdx) => (
            <div key={col.top.id} className={MOBILE_COLUMN_CLASS}>
              <div className="w-full min-w-0">
                <CategoryItem
                  category={col.top}
                  onCategoryClick={onCategoryClick}
                  index={colIdx * 2}
                />
              </div>
              {col.bottom ? (
                <div className="w-full min-w-0">
                  <CategoryItem
                    category={col.bottom}
                    onCategoryClick={onCategoryClick}
                    index={colIdx * 2 + 1}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-turquoise transition-all duration-300 ease-out"
          style={{ width: `${rail.scrollProgress}%` }}
        />
      </div>
    </div>
  );
}

const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryTile[]>(FALLBACK_CATEGORIES);

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

  const handleCategoryClick = (category: CategoryTile, e: React.MouseEvent) => {
    e.preventDefault();
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    if (category.link) {
      navigate(category.link);
    } else {
      navigate(`/categories/${category.slug}`);
    }
  };

  return (
    <section aria-label="Категории" className="relative max-w-7xl mx-auto px-4 sm:px-5 py-4">
      <CategoryGridMobile categories={categories} onCategoryClick={handleCategoryClick} />
      <CategoryGridDesktop categories={categories} onCategoryClick={handleCategoryClick} />
    </section>
  );
};

export default CategoryGrid;
