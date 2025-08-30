import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

const TopHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="hidden md:block bg-gray-100 py-2 px-4 text-sm">
      <div
        className="max-w-7xl mx-auto flex justify-start items-center relative"
        ref={rootRef}
      >
        <div className="relative">
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

          {open && (
            <div
              role="dialog"
              aria-label="Адрес шоурума"
              className="absolute left-0 mt-2 rounded-xl bg-white shadow-xl border border-gray-100 p-5 w-72"
            >
              <h3 className="text-base font-semibold mb-3">Наш адрес</h3>
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin size={18} className="text-teal-600 mt-0.5" />
                <span>Душанбе, Пулоди 4</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
