// src/components/mattresses/MattressTypeGrid.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface MattressType {
  id: string;
  name: string;
  image_url: string;
  type_id: string;
  width_min: number | null;
  width_max: number | null;
  age_categories: string[] | null;
  preferences: string[] | null;
  mattress_types: string[] | null;
}

interface MattressTypeGridProps {
  sectionTitle?: string;
}

const MattressTypeGrid: React.FC<MattressTypeGridProps> = ({ sectionTitle = 'По типу' }) => {
  const navigate = useNavigate();
  const [types, setTypes] = useState<MattressType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('mattress_types')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error loading mattress types:', error);
          return;
        }

        if (data) {
          setTypes(data as MattressType[]);
          console.log('Loaded mattress types:', data.length);
        } else {
          console.warn('No mattress types data returned');
        }
      } catch (e) {
        console.error('Error loading mattress types:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (type: MattressType) => {
    const selectedCategories = ['mattresses'] as string[];

    const baseFilters = {
      age: [] as string[],
      hardness: [] as string[],
      width: [] as number[],
      length: [] as number[],
      height: [] as number[],
      price: [] as number[],
      inStock: true,
      productType: selectedCategories,
      mattressType: [] as string[],
      preferences: [] as string[],
      functions: [] as string[],
      weightCategory: [] as string[],
    };

    let filters = { ...baseFilters };

    // Apply width filters if available
    if (type.width_min !== null || type.width_max !== null) {
      filters.width = [type.width_min ?? 0, type.width_max ?? 300];
    }

    // Apply age categories if available
    if (type.age_categories && type.age_categories.length > 0) {
      filters.age = type.age_categories;
    }

    // Apply preferences if available
    if (type.preferences && type.preferences.length > 0) {
      filters.preferences = type.preferences;
    }

    // Apply mattress types if available
    if (type.mattress_types && type.mattress_types.length > 0) {
      filters.mattressType = type.mattress_types;
    }

    navigate('/products', {
      state: {
        selectedCategories,
        filters,
        fromTypeShortcut: type.type_id,
      },
    });
  };

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  if (types.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => handleSelect(type)}
            className="text-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
            aria-label={`Показать матрасы: ${type.name}`}
          >
            <div className="mx-auto mb-3 overflow-hidden bg-gray-100">
              <img
                src={type.image_url}
                alt={type.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/200x150/e5e7eb/9ca3af?text=Type';
                }}
              />
            </div>
            <p className="text-sm font-medium group-hover:text-teal-600 transition-colors">
              {type.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MattressTypeGrid;
