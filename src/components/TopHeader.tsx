import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const POPULAR_CITIES = [
  'Москва','Санкт-Петербург','Волгоград','Воронеж','Екатеринбург',
  'Казань','Киров','Красноярск','Нижний Новгород','Новосибирск',
  'Омск','Пермь','Ростов-на-Дону','Самара','Уфа'
];

const TopHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // filter cities as user types
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return POPULAR_CITIES;
    return POPULAR_CITIES.filter(c => c.toLowerCase().includes(s));
  }, [q]);

  // close on outside click
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

  // focus the search when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  return (
    <div className="hidden md:block bg-gray-100 py-2 px-4 text-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative" ref={rootRef}>
        <div className="flex items-center space-x-4">
          {/* Шоурумы trigger + panel */}
          <div className="relative">
            <button
              ref={btnRef}
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

            {/* Dropdown panel */}
            {open && (
              <div
                role="dialog"
                aria-label="Выбор города"
                className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden"
              >
                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Поиск города"
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>

                {/* Popular cities */}
                <div className="p-5">
                  <h3 className="text-base font-semibold mb-4">Популярные города</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                    {filtered.map((city) => (
                      <button
                        key={city}
                        type="button"
                        className="text-left text-gray-700 hover:text-teal-600"
                        onClick={() => {
                          // TODO: plug your city select handler here
                          // e.g. setCity(city); fetch showrooms(); etc.
                          setOpen(false);
                        }}
                      >
                        {city}
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <div className="text-gray-500">Ничего не найдено</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="#" className="hover:text-teal-600">Услуги</a>
        </div>

        <div className="flex items-center space-x-6">
          <div className="group relative">
            <button className="flex items-center hover:text-teal-600">
              Доставка и оплата
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          <a href="tel:+992905339595" className="font-medium hover:text-teal-600">+992 90 533 9595</a>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
