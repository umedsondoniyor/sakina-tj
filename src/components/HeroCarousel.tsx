import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  // gestures
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const endX = useRef(0);

  // autoplay
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // respect reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // fetch slides
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCarouselSlides();
        setSlides(Array.isArray(data) ? data : []);
        setErr(null);
      } catch (e) {
        console.error(e);
        setErr('Failed to load carousel slides');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // keep current index valid if slides change
  useEffect(() => {
    if (!slides.length) return;
    setCurrent((idx) => (idx % slides.length + slides.length) % slides.length);
  }, [slides.length]);

  // visibility + intersection: pause when hidden or offscreen
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stopAutoplay();
      else maybeStartAutoplay();
    };
    document.addEventListener('visibilitychange', onVis);

    let observer: IntersectionObserver | null = null;
    if (containerRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting) maybeStartAutoplay();
          else stopAutoplay();
        },
        { threshold: 0.2 }
      );
      observer.observe(containerRef.current);
    }
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      observer?.disconnect();
    };
  }, []);

  // start/stop autoplay
  const stopAutoplay = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const startAutoplay = () => {
    if (!slides.length || prefersReducedMotion || isPaused.current) return;
    stopAutoplay();
    timer.current = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  const maybeStartAutoplay = () => {
    if (!prefersReducedMotion && !document.hidden) startAutoplay();
  };

  // start autoplay when slides load
  useEffect(() => {
    if (!slides.length) return;
    maybeStartAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, prefersReducedMotion]);

  // navigation helpers
  const goPrev = () => {
    if (!slides.length) return;
    stopAutoplay();
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
    maybeStartAutoplay();
  };
  const goNext = () => {
    if (!slides.length) return;
    stopAutoplay();
    setCurrent((p) => (p + 1) % slides.length);
    maybeStartAutoplay();
  };
  const goTo = (i: number) => {
    if (!slides.length) return;
    stopAutoplay();
    const clamped = ((i % slides.length) + slides.length) % slides.length;
    setCurrent(clamped);
    maybeStartAutoplay();
  };

  // drag/swipe
  const beginDrag = () => {
    setDragging(true);
    isPaused.current = true;
    stopAutoplay();
  };
  const endDrag = () => {
    setDragging(false);
    isPaused.current = false;
    const delta = startX.current - endX.current;
    if (delta > SWIPE_MIN) goNext();
    else if (delta < -SWIPE_MIN) goPrev();
    startX.current = 0;
    endX.current = 0;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    beginDrag();
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    endX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => endDrag();

  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    beginDrag();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    endX.current = e.clientX;
  };
  const onMouseUp = () => endDrag();
  const onMouseLeave = () => dragging && endDrag();

  // keyboard
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
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
              setSlides(Array.isArray(data) ? data : []);
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
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden group select-none"
        role="region"
        aria-roledescription="carousel"
        aria-label="Промо слайды"
        tabIndex={0}
        onKeyDown={onKeyDown}
        // pause autoplay when user hovers (desktop)
        onMouseEnter={() => { isPaused.current = true; stopAutoplay(); }}
        onMouseLeave={() => { isPaused.current = false; maybeStartAutoplay(); }}
      >
        <div
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          // keep vertical scrolling smooth on touch devices
          style={{ touchAction: 'pan-y' }}
          onDragStart={(e) => e.preventDefault()}
          aria-live="polite"
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <HeroSlide slide={slide} isActive={i === current} />
            </div>
          ))}

          {/* Left control (desktop) */}
          <button
            type="button"
            aria-label="Предыдущий слайд"
            onClick={goPrev}
            className="
              flex items-center justify-center
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              p-2 rounded-full bg-white/80 backdrop-blur shadow
              hover:bg-white transition
              opacity-0 group-hover:opacity-100 focus:opacity-100
            "
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right control (desktop) */}
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
            "
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <SlideIndicators
        totalSlides={slides.length}
        currentSlide={current}
        onSlideChange={goTo}
        onStartAutoPlay={maybeStartAutoplay}
      />
    </div>
  );
};

export default HeroCarousel;
