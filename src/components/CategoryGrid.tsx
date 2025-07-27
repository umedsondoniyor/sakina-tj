import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

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
    if (category.slug === 'mattresses') {
      navigate('/mattresses');
    } else if (category.link) {
      navigate(category.link);
    } else {
      navigate(`/products?category=${category.slug}`);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-4">
      <div className="relative">
        {/* Navigation Buttons - Desktop Only */}
        <div className="hidden md:block">
          {canScrollLeft && (
            <button
              onClick={handleScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={handleScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

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
          {/* Mobile Swipe Hint */}
          {showSwipeHint && (
            <div className="md:hidden absolute inset-0 z-10 pointer-events-none">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-full flex items-center">
                <svg className="w-4 h-4 mr-1.5\" viewBox="0 0 24 24\" fill="none\" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3\" stroke="currentColor\" strokeWidth="2\" strokeLinecap="round\" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">Листайте</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-swipe" />
            </div>
          )}

          {/* Desktop View */}
          <div className="hidden md:flex justify-between w-full">
            {categories.map((category) => (
              <a
                key={category.id}
                href={category.slug === 'mattresses' ? '/mattresses' : `/products?category=${category.slug}`}
                onClick={(e) => handleCategoryClick(category, e)}
                className="group content-center"
              >
                <div className="aspect-square bg-white rounded-lg overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="block text-[16px] font-medium leading-tight text-center text-gray-900 group-hover:text-brand-turquoise">
                  {category.name}
                </span>
              </a>
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden grid grid-rows-2 grid-flow-col gap-x-4 gap-y-4 auto-cols-[110px] min-w-max">
            {categories.map((category) => (
              <a
                key={category.id}
                href={category.slug === 'mattresses' ? '/mattresses' : `/products?category=${category.slug}`}
                onClick={(e) => handleCategoryClick(category, e)}
                className="group"
              >
                <div className="aspect-square mb-1.5 bg-white rounded-lg overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <span className="block text-[11px] leading-tight text-center text-gray-900 group-hover:text-brand-turquoise">
                  {category.name}
                </span>
              </a>
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