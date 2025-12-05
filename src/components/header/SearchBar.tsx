import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../lib/utils';
import { getProductsByCategory } from '../../lib/api';

type ProductSuggestion = {
  id: string;
  name: string;
  image_url: string | null;
  price: number | null;
};

const rotatingPlaceholders = ['матрас Sakina', 'кровать Sakina', 'подушка Sakina'];

// Category mapping: supports both Russian (Cyrillic) and Latin input
const CATEGORY_MAP: Record<string, string> = {
  // Russian (Cyrillic) -> category slug
  'матрас': 'mattresses',
  'матрасы': 'mattresses',
  'матрац': 'mattresses',
  'матрацы': 'mattresses',
  'кровать': 'beds',
  'кровати': 'beds',
  'подушка': 'pillows',
  'подушки': 'pillows',
  'одеяло': 'blankets',
  'одеяла': 'blankets',
  'диван': 'sofas',
  'диваны': 'sofas',
  'кресло': 'sofas',
  'кресла': 'sofas',
  'чехол': 'covers',
  'чехлы': 'covers',
  'мебель': 'furniture',
  'массажное кресло': 'smartchair',
  'массажные кресла': 'smartchair',
  'для детей': 'kids',
  'детское': 'kids',
  'карта': 'map',
  'карты': 'map',
  
  // Latin -> category slug
  'mattress': 'mattresses',
  'mattresses': 'mattresses',
  'bed': 'beds',
  'beds': 'beds',
  'pillow': 'pillows',
  'pillows': 'pillows',
  'blanket': 'blankets',
  'blankets': 'blankets',
  'sofa': 'sofas',
  'sofas': 'sofas',
  'chair': 'sofas',
  'chairs': 'sofas',
  'cover': 'covers',
  'covers': 'covers',
  'furniture': 'furniture',
  'smart chair': 'smartchair',
  'smartchair': 'smartchair',
  'massage chair': 'smartchair',
  'kids': 'kids',
  'children': 'kids',
  'map': 'map',
  'maps': 'map',
};

// Category display names
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  mattresses: 'Матрасы',
  beds: 'Кровати',
  pillows: 'Подушки',
  blankets: 'Одеяла',
  sofas: 'Диваны и кресла',
  covers: 'Чехлы',
  furniture: 'Мебель',
  smartchair: 'Массажные кресла',
  kids: 'Для детей',
  map: 'Карты',
};

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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isCategorySearch, setIsCategorySearch] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Detect if query matches a category
  const detectCategory = useCallback((q: string): string | null => {
    const normalized = q.trim().toLowerCase();
    return CATEGORY_MAP[normalized] || null;
  }, []);

  // close on click outside or Escape key
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSelectedIndex(-1);
      }
    };
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
      }
    };
    
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // debounced fetch suggestions from Supabase
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsCategorySearch(false);
      setCategoryName(null);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        
        // Check if query matches a category
        const detectedCategory = detectCategory(q);
        
        if (detectedCategory) {
          // Category search: fetch all products in that category
          setIsCategorySearch(true);
          setCategoryName(detectedCategory);
          
          const products = await getProductsByCategory(detectedCategory);
          const categorySuggestions: ProductSuggestion[] = products
            .slice(0, 12) // Show more products for category searches
            .map(p => ({
              id: p.id,
              name: p.name,
              image_url: p.image_url,
              price: p.price,
            }));
          
          setSuggestions(categorySuggestions);
        } else {
          // Regular product name search
          setIsCategorySearch(false);
          setCategoryName(null);
          
          const { data, error } = await supabase
            .from('products')
            .select('id,name,image_url,price')
            .ilike('name', `%${q}%`)
            .limit(8);

          if (error) throw error;
          setSuggestions((data || []) as ProductSuggestion[]);
        }
      } catch (e) {
        console.error('search error:', e);
        setSuggestions([]);
        setIsCategorySearch(false);
        setCategoryName(null);
      } finally {
        setLoading(false);
      }
    }, 250); // debounce

    return () => clearTimeout(handle);
  }, [query, open, detectCategory]);

  const onSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;
    
    // If a suggestion is selected, go to that product
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      goToProduct(suggestions[selectedIndex].id);
      return;
    }
    
    // If it's a category search, navigate to products page with category filter
    const detectedCategory = detectCategory(q);
    if (detectedCategory) {
      navigate(`/products?category=${encodeURIComponent(detectedCategory)}`);
      setOpen(false);
      setSelectedIndex(-1);
      return;
    }
    
    // Otherwise, go to products page with query string
    navigate(`/products?query=${encodeURIComponent(q)}`);
    setOpen(false);
    setSelectedIndex(-1);
  }, [query, selectedIndex, suggestions, navigate, detectCategory]);

  const goToProduct = useCallback((id: string) => {
    setOpen(false);
    setSelectedIndex(-1);
    navigate(`/products/${id}`);
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open || suggestions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        if (selectedIndex < suggestions.length) {
          goToProduct(suggestions[selectedIndex].id);
        }
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('keydown', handleKeyDown);
      return () => input.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, suggestions, selectedIndex, goToProduct]);

  // computed placeholder (only when empty input)
  const placeholder = useMemo(() => {
    return query ? 'Поиск' : placeholderText || 'Поиск';
  }, [query, placeholderText]);

  return (
    <div className="w-full" ref={boxRef}>
      <form onSubmit={onSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          aria-label="Поиск товаров"
          aria-expanded={open}
          aria-autocomplete="list"
          className="
            w-full pl-10 pr-20 py-2
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-brand-turquoise focus:border-transparent
            transition-all duration-200
          "
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        
        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Очистить поиск"
            className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
        
        {/* Submit/Search button */}
        <button
          type="submit"
          aria-label="Искать"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-brand-turquoise transition-colors rounded hover:bg-gray-100"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
        </button>

        {/* Suggestions dropdown */}
        {open && (query.trim().length >= 2 || loading) && (
          <div
            ref={suggestionsRef}
            role="listbox"
            className="
              absolute left-0 right-0 mt-2 z-50
              rounded-lg border border-gray-200 bg-white shadow-xl
              max-h-72 overflow-auto
              animate-in fade-in slide-in-from-top-2 duration-200
            "
          >
            {/* Category indicator */}
            {isCategorySearch && categoryName && (
              <div className="px-4 py-2 bg-teal-50 border-b border-teal-100">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-teal-600" />
                  <span className="text-sm font-medium text-teal-900">
                    {CATEGORY_DISPLAY_NAMES[categoryName] || categoryName}
                  </span>
                  <span className="text-xs text-teal-600">
                    ({suggestions.length} {suggestions.length === 1 ? 'товар' : 'товаров'})
                  </span>
                </div>
              </div>
            )}
            
            {loading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span>Поиск…</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">Ничего не найдено</div>
            ) : (
              suggestions.map((s, index) => (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => goToProduct(s.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full text-left px-4 py-2.5 flex items-center gap-3
                    transition-colors duration-150
                    ${selectedIndex === index 
                      ? 'bg-teal-50 border-l-2 border-teal-500' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt={s.name}
                      className="h-10 w-10 rounded object-cover border border-gray-100 flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                    {s.price != null && (
                      <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(s.price)}</div>
                    )}
                  </div>
                </button>
              ))
            )}
            {/* footer action: search for the whole query or view all category products */}
            {query.trim().length >= 2 && suggestions.length > 0 && (
              <button
                type="submit"
                className={`
                  w-full text-left px-4 py-2.5 border-t border-gray-100 
                  text-sm font-medium text-brand-turquoise hover:bg-teal-50
                  transition-colors duration-150
                  ${selectedIndex === suggestions.length ? 'bg-teal-50' : ''}
                `}
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
              >
                {isCategorySearch && categoryName
                  ? `Показать все ${CATEGORY_DISPLAY_NAMES[categoryName]?.toLowerCase() || categoryName}`
                  : `Искать "${query.trim()}"`
                }
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
