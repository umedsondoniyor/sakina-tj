import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

const TopHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // close on outside click + Esc
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
      <div className="max-w-7xl mx-auto flex justify-between items-center relative" ref={rootRef}>
        <div className="flex items-center space-x-4">
          {/* Шоурумы trigger + single-address panel */}
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
                className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  <h3 className="text-base font-semibold mb-3">Адрес шоурума</h3>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: hook up navigation/map opening if needed
                      // e.g., window.open('https://maps.google.com/?q=Душанбе, Пулоди 4', '_blank')
                      setOpen(false);
                    }}
                    className="flex items-start gap-2 text-left text-gray-700 hover:text-teal-600"
                  >
                    <MapPin size={18} className="mt-0.5 shrink-0" />
                    <span>Душанбе, Пулоди 4</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <a href="#" className="hover:text-teал-600">Услуги</a>
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
    </div>
  );
};

export default TopHeader;
