import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { getCarouselSlides } from '../lib/api';
import type { CarouselSlide } from '../lib/types';
import HeroSlide from './hero/HeroSlide';
import SlideIndicators from './hero/SlideIndicators';

const AUTOPLAY_MS = 5000;
const SWIPE_MIN = 50;

const HeroCarousel: React.FC = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // drag/swipe state
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const endX = useRef(0);

  // autoplay
  const timer = useRef<NodeJS.Timeout | null>(null);

  // fetch slides
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCarouselSlides();
        setSlides(data || []);
        setErr(null);
      } catch (e) {
        console.error(e);
        setErr('Failed to load carousel slides');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // autoplay lifecycle
  useEffect(() => {
    if (!slides.length) return;
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  const startAutoplay = () => {
    stopAutoplay();
    timer.current = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  const stopAutoplay = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  // nav helpers
  const goPrev = () => {
    if (!slides.length) return;
    stopAutoplay();
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
    startAutoplay();
  };
  const goNext = () => {
    if (!slides.length) return;
    stopAutoplay();
    setCurrent((p) => (p + 1) % slides.length);
    startAutoplay();
  };
  const goTo = (i: number) => {
    stopAutoplay();
    setCurrent(i);
    startAutoplay();
  };

  // touch/drag handlers
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    draggingRef(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    endX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    finishDrag();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    draggingRef(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    endX.current = e.clientX;
  };
  const onMouseUp = () => finishDrag();
  const onMouseLeave = () => dragging && finishDrag();

  const draggingRef = (state: boolean) => {
    setDragging(state);
    if (state) stopAutoplay();
  };

  const finishDrag = () => {
    setDragging(false);
    const delta = startX.current - endX.current;
    if (delta > SWIPE_MIN) goNext();
    else if (delta < -SWIPE_MIN) goPrev();
    startX.current = 0;
    endX.current = 0;
  };

  // UI states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100">
        <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600">{err}</p>
        <button
          onClick={async () => {
            try {
              setLoading(true);
              const data = await getCarouselSlides();
              setSlides(data || []);
              setErr(null);
            } catch (e) {
              setErr('Failed to load carousel slides');
            } finally {
              setLoading(false);
            }
          }}
          className="mt-4 rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100">
        <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600">No slides available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* group => hover-reveal arrows; aspect-* => stable height */}
      <div className="relative w-full overflow-hidden group">
        <div
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {/* Slides stacked; each fills frame */}
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === current ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Your slide component should fill container */}
              <HeroSlide slide={slide} isActive={i === current} />
            </div>
          ))}

          {/* Left/Right controls — desktop only, reveal on hover/focus */}
          <button
            type="button"
            aria-label="Предыдущий слайд"
            onClick={goPrev}
            className="
              hidden md:flex items-center justify-center
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              p-2 rounded-full bg-white/80 backdrop-blur shadow
              hover:bg-white transition
              opacity-0 group-hover:opacity-100 focus:opacity-100
              pointer-events-auto
            "
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            aria-label="Следующий слайд"
            onClick={goNext}
            className="
              hidden md:flex items-center justify-center
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              p-2 rounded-full bg-white/80 backdrop-blur shadow
              hover:bg-white transition
              opacity-0 group-hover:opacity-100 focus:opacity-100
              pointer-events-auto
            "
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* Slide indicators */}
      <SlideIndicators
        totalSlides={slides.length}
        currentSlide={current}
        onSlideChange={goTo}
        onStartAutoPlay={startAutoplay}
      />
    </div>
  );
};

export default HeroCarousel;
