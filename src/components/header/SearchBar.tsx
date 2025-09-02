import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient'; // adjust path if different

type ProductSuggestion = {
  id: string;
  name: string;
  image_url: string | null;
  price: number | null;
};

const rotatingPlaceholders = ['матрас Sakina', 'кровать Sakina', 'подушка Sakina'];

const SearchBar: React.FC = () => {
  const navigate = useNavigate();

  // --- typing placeholder animation (same idea, but with a small leak fix)
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');
  const [delta, setDelta] = useState(200 - Math.random() * 100);
  useEffect(() => {
    const tick = () => {
      const currentTerm = rotatingPlaceholders[placeholderIndex];
      const updated = isDeleting
        ? placeholderText.substring(0, placeholderText.length - 1)
        : currentTerm.substring(0, placeholderText.length + 1);

      setPlaceholderText(updated);

      if (isDeleting) setDelta(100);
      if (!isDeleting && updated === currentTerm) {
        setIsDeleting(true);
        setDelta(2000);
      } else if (isDeleting && updated === '') {
        setIsDeleting(false);
        setPlaceholderIndex((i) => (i + 1) % rotatingPlaceholders.length);
        setDelta(500);
      }
    };

    const t = setTimeout(tick, delta);
    return () => clearTimeout(t);
  }, [placeholderText, isDeleting, placeholderIndex, delta]);

  // --- search query + suggestions
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // close on click outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // debounced fetch suggestions from Supabase
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('id,name,image_url,price')
          .ilike('name', `%${q}%`)
          .limit(8);

        if (error) throw error;
        setSuggestions((data || []) as ProductSuggestion[]);
      } catch (e) {
        console.error('search error:', e);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250); // debounce

    return () => clearTimeout(handle);
  }, [query, open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    // go to products page with query string
    navigate(`/products?query=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const goToProduct = (id: string) => {
    setOpen(false);
    navigate(`/products/${id}`);
  };

  // computed placeholder (only when empty input)
  const placeholder = useMemo(() => {
    return query ? 'Поиск' : placeholderText || 'Поиск';
  }, [query, placeholderText]);

  return (
    <div className="flex-1 max-w-2xl mx-8" ref={boxRef}>
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Поиск товаров"
          className="
            w-full pl-10 pr-10 py-2
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-brand-turquoise
          "
        />
        <button
          type="submit"
          aria-label="Искать"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-brand-turquoise"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={20} />}
        </button>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

        {/* Suggestions dropdown */}
        {open && (query.trim().length >= 2 || loading) && (
          <div
            role="listbox"
            className="
              absolute left-0 right-0 mt-2 z-50
              rounded-lg border border-gray-200 bg-white shadow-lg
              max-h-72 overflow-auto
            "
          >
            {loading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">Поиск…</div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">Ничего не найдено</div>
            ) : (
              suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  onClick={() => goToProduct(s.id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                >
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt={s.name}
                      className="h-8 w-8 rounded object-cover border border-gray-100"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                    {s.price != null && (
                      <div className="text-xs text-gray-500">{s.price.toLocaleString()} c.</div>
                    )}
                  </div>
                </button>
              ))
            )}
            {/* footer action: search for the whole query */}
            {query.trim().length >= 2 && (
              <button
                type="submit"
                className="w-full text-left px-4 py-2 border-t border-gray-100 text-sm text-brand-turquoise hover:bg-gray-50"
              >
                Искать “{query.trim()}”
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
