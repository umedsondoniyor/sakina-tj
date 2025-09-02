import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, MapPin } from 'lucide-react';

const TopHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [panelRect, setPanelRect] = useState<{ left: number; top: number; width: number } | null>(null);

  const address = 'Душанбе, Пулоди 4';
  // ✅ Your fixed maps short link
  const shopLink = 'https://maps.app.goo.gl/5exgpkraKy9foeD27';

  // measure where to place the fixed dropdown
  const measure = () => {
    const el = rowRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelRect({
      left: Math.round(r.left),
      top: Math.round(r.bottom),
      width: Math.round(r.width),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => measure();
    const onResize = () => measure();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const panel = document.getElementById('showrooms-panel');
      if (panel && panel.contains(e.target as Node)) return;
      if (rowRef.current && rowRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Panel = open && panelRect
    ? createPortal(
        <div
          id="showrooms-panel"
          style={{
            position: 'fixed',
            left: panelRect.left,
            top: panelRect.top + 8,
            zIndex: 1000,
            width: panelRect.width, // optional: match trigger width
          }}
        >
          <div className="rounded-xl bg-white shadow-xl border border-gray-100">
            <div className="p-5">
              {/* 🔗 Direct link to your map. Keeps dropdown structure for future multiple locations */}
              <a
                href={shopLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-left text-gray-700 hover:text-teal-600"
                onClick={() => setOpen(false)}
              >
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>{address}</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="hidden md:block bg-gray-100 py-2 px-4 text-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left row (used for measuring width/left) */}
        <div ref={rowRef} className="flex items-center space-x-4 relative">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex items-center hover:text-teal-600"
          >
            Шоурумы
            <ChevronDown
              size={16}
              className={`ml-1 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
          <a href="#" className="hover:text-teal-600">Услуги</a>
        </div>

        <div className="flex items-center space-x-6">
          <div className="group relative">
            <button className="flex items-center hover:text-teal-600">
              Доставка и оплата
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          <a href="tel:+992905339595" className="font-medium hover:text-teal-600">
            +992 90 533 9595
          </a>
        </div>
      </div>

      {Panel}
    </div>
  );
};

export default TopHeader;
