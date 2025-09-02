import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react'; // ⬅ import arrows
import { getCarouselSlides } from '../lib/api';
import type { CarouselSlide } from '../lib/types';
import HeroSlide from './hero/HeroSlide';
import SlideIndicators from './hero/SlideIndicators';

const HeroCarousel = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const minSwipeDistance = 50;

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await getCarouselSlides();
      setSlides(data);
    } catch (err) {
      setError('Failed to load carousel slides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slides.length > 0) {
      startAutoPlay();
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [slides]);

  const startAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const goPrev = () => {
    if (!slides.length) return;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    startAutoPlay();
  };

  const goNext = () => {
    if (!slides.length) return;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startAutoPlay();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    startAutoPlay();

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100">
        <PackageOpen className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={loadSlides}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100">
        <PackageOpen className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No slides available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Relative wrapper so we can absolutely-position arrows & dots */}
      <div className="relative w-full overflow-hidden">
        <div
          className="relative w-full overflow-hidden after:clear-both after:block after:content-['']"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {slides.map((slide, index) => (
            <HeroSlide
              key={slide.id}
              slide={slide}
              isActive={index === currentSlide}
            />
          ))}
        </div>

        {/* ⬅︎ Left / Right buttons, centered vertically, white circular like screenshot */}
        <button
          type="button"
          aria-label="Предыдущий слайд"
          onClick={goPrev}
          className="
            absolute left-3 top-1/2 -translate-y-1/2 z-10
            flex h-12 w-12 items-center justify-center
            rounded-full bg-white shadow-md
            hover:shadow-lg hover:bg-white/90
            transition
          "
        >
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          aria-label="Следующий слайд"
          onClick={goNext}
          className="
            absolute right-3 top-1/2 -translate-y-1/2 z-10
            flex h-12 w-12 items-center justify-center
            rounded-full bg-white shadow-md
            hover:shadow-lg hover:bg-white/90
            transition
          "
        >
          <ChevronRight size={24} />
        </button>

        {/* Indicators pinned inside the banner (bottom-center) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <SlideIndicators
            totalSlides={slides.length}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onStartAutoPlay={startAutoPlay}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
