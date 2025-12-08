import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface PopularFilter {
  id: string;
  name: string;
  description: string;
  image_url: string;
  age_categories: string[] | null;
  preferences: string[] | null;
  functions: string[] | null;
}

interface PopularFiltersProps {
  sectionTitle?: string;
}

const PopularFilters = ({ sectionTitle = 'Популярные фильтры' }: PopularFiltersProps) => {
  const navigate = useNavigate();
  const [popularFilters, setPopularFilters] = useState<PopularFilter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('mattress_popular_filters')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error loading popular filters:', error);
          return;
        }

        if (data) {
          setPopularFilters(data as PopularFilter[]);
          console.log('Loaded popular filters:', data.length);
        } else {
          console.warn('No popular filters data returned');
        }
      } catch (e) {
        console.error('Error loading popular filters:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (filter: PopularFilter) => {
    const baseFilters = {
      age: [] as string[],
      hardness: [] as string[],
      width: [] as number[],
      length: [] as number[],
      height: [] as number[],
      price: [] as number[],
      inStock: false,
      productType: ['mattresses'],
      mattressType: [] as string[],
      preferences: [] as string[],
      functions: [] as string[],
      weightCategory: [] as string[],
    };

    let filters = { ...baseFilters };

    // Apply age categories if available
    if (filter.age_categories && filter.age_categories.length > 0) {
      filters.age = filter.age_categories;
    }

    // Apply preferences if available
    if (filter.preferences && filter.preferences.length > 0) {
      filters.preferences = filter.preferences;
    }

    // Apply functions if available
    if (filter.functions && filter.functions.length > 0) {
      filters.functions = filter.functions;
    }

    navigate('/products', {
      state: {
        selectedCategories: ['mattresses'],
        filters,
        fromPopularFilter: filter.id,
      },
    });
  };

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  if (popularFilters.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popularFilters.map((filter) => (
          <div
            key={filter.id}
            onClick={() => handleSelect(filter)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(filter);
              }
            }}
            aria-label={`Выбрать ${filter.name.toLowerCase()}`}
          >
            <img
              className="w-16 h-16 object-contain group-hover:scale-105 transition-transform mr-4"
              src={filter.image_url}
              alt={filter.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/64x64/e5e7eb/9ca3af?text=Icon';
              }}
            />
            <div>
              <h3 className="font-medium">{filter.name}</h3>
              <p className="text-sm text-gray-600">{filter.description}</p>
            </div>
            <ChevronRight size={20} className="ml-auto text-gray-400" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularFilters;