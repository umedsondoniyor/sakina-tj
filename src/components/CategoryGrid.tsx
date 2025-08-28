import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryItem from './category/CategoryItem';
import CategoryScrollControls from './category/CategoryScrollControls';
import SwipeHint from './category/SwipeHint';

const categories = [
  {
    id: 1,
    name: 'Матрасы',
    image: 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png',
    slug: 'mattresses'
  },
  {
    id: 2,
    name: 'Кровати',
    image: 'https://ik.imagekit.io/3js0rb3pk/categ_bed.png',
    slug: 'beds',
    link: '/products?category=beds'
  },
  {
    id: 3,
    name: 'Одеяло',
    image: 'https://ik.imagekit.io/3js0rb3pk/categ_blanket.png'
  },

  {
    id: 4,
    name: 'Массажное кресло',
    image: '/images/smart-chair-b.png',
    slug: 'massage-chairs'
  },
  {
    id: 5,
    name: 'Подушки',
    image: 'https://ik.imagekit.io/3js0rb3pk/categ_pillow.png',
    slug: 'pillows',
    link: '/products?category=pillows'
  },
  {
    id: 6,
    name: 'Карта мира',
    image: 'https://ik.imagekit.io/3js0rb3pk/categ_map.png',
    slug: 'world-maps',
    link: '/products?category=map'
  },
  // {
  //   id: 7,
  //   name: 'Декорация',
  //   image: '/images/decor-table.webp'
  // },
];

const CategoryGrid = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  const updateScrollProgress = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollProgress);
      // Initial check
      updateScrollProgress();
      return () => container.removeEventListener('scroll', updateScrollProgress);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollLeft - walk;
    setStartX(x);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setShowSwipeHint(false);
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollLeft - walk;
    setStartX(x);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (category: typeof categories[0], e: React.MouseEvent) => {
    e.preventDefault();
    
    // Clear any existing navigation state immediately
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    
    if (category.slug === 'mattresses') {
      navigate('/mattresses');
    } else if (category.link) {
      navigate(category.link);
    } else {
      // Navigate with immediate state to prevent glitches
      navigate(`/products?category=${category.slug}`, {
        replace: true,
        state: {
          selectedCategories: [category.slug],
          immediate: true
        }
      });
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-4">
      <div className="relative">
        <CategoryScrollControls
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onScrollLeft={handleScrollLeft}
          onScrollRight={handleScrollRight}
        />

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide relative"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <SwipeHint showSwipeHint={showSwipeHint} />

          {/* Desktop View */}
          <div className="hidden md:flex justify-between w-full">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onCategoryClick={handleCategoryClick}
              />
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden grid grid-rows-2 grid-flow-col gap-x-4 gap-y-4 auto-cols-[110px] min-w-max">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onCategoryClick={handleCategoryClick}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar - Mobile Only */}
        <div className="md:hidden h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-turquoise transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;