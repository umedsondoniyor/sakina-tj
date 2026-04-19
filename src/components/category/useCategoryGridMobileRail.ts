import { useCallback, useEffect, useRef, useState } from 'react';

const SWIPE_HINT_HIDE_MS = 3000;
export const CATEGORY_SCROLL_NUDGE_PX = 220;

export function useCategoryGridMobileRail(categoriesLength: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (!showSwipeHint) return;
    const t = window.setTimeout(() => setShowSwipeHint(false), SWIPE_HINT_HIDE_MS);
    return () => clearTimeout(t);
  }, [showSwipeHint]);

  const updateScrollMetrics = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = Math.max(0, scrollWidth - clientWidth);
    setScrollProgress(max ? (scrollLeft / max) * 100 : 0);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollMetrics, { passive: true });
    updateScrollMetrics();
    return () => el.removeEventListener('scroll', updateScrollMetrics);
  }, [categoriesLength, updateScrollMetrics]);

  const startDrag = useCallback((clientX: number) => {
    draggingRef.current = true;
    const left = scrollRef.current?.getBoundingClientRect().left ?? 0;
    dragStartXRef.current = clientX - left;
  }, []);

  const doDrag = useCallback((clientX: number) => {
    if (!draggingRef.current || !scrollRef.current) return;
    const left = scrollRef.current.getBoundingClientRect().left;
    const x = clientX - left;
    const walk = (x - dragStartXRef.current) * 2;
    scrollRef.current.scrollLeft -= walk;
    dragStartXRef.current = x;
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const scrollBy = useCallback((delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const dismissSwipeHint = useCallback(() => setShowSwipeHint(false), []);

  return {
    scrollRef,
    showSwipeHint,
    scrollProgress,
    canScrollLeft,
    canScrollRight,
    startDrag,
    doDrag,
    endDrag,
    scrollBy,
    dismissSwipeHint,
  };
}
