import React, { useState, useEffect, useRef } from 'react';
import { getCarouselSlides } from '../lib/api';
import type { CarouselSlide } from '../lib/types';
import { PackageOpen } from 'lucide-react';

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
            <div
              key={slide.id}
              className={`relative float-left -mr-[100%] w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ pointerEvents: index === currentSlide ? 'auto' : 'none' }}
            >
              <div className="relative w-full mx-auto">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="hero-image mx-auto"
                />
                {/* {(slide.title || slide.subtitle) && (
                  <div className="absolute bottom-8 left-8 text-white">
                    {slide.title && (
                      <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-lg md:text-xl">{slide.subtitle}</p>
                    )}
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center items-center space-x-1.5 py-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              startAutoPlay();
            }}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-teal-500' : 'bg-gray-300'
            } hover:bg-teal-400`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;