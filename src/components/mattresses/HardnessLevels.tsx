import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface HardnessLevel {
  id: string;
  name: string;
  description: string;
  level: number;
  hardness_value: string;
}

interface HardnessLevelsProps {
  sectionTitle?: string;
}

const HardnessLevels = ({ sectionTitle = 'По жесткости' }: HardnessLevelsProps) => {
  const navigate = useNavigate();
  const [hardnessLevels, setHardnessLevels] = useState<HardnessLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('mattress_hardness_levels')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error loading hardness levels:', error);
          return;
        }

        if (data) {
          setHardnessLevels(data as HardnessLevel[]);
          console.log('Loaded hardness levels:', data.length);
        } else {
          console.warn('No hardness levels data returned');
        }
      } catch (e) {
        console.error('Error loading hardness levels:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (level: HardnessLevel) => {
    navigate('/products', {
      state: {
        selectedCategories: ['mattresses'],
        filters: {
          age: [],
          hardness: [level.hardness_value],
          width: [],
          length: [],
          height: [],
          price: [],
          inStock: false,
          productType: ['mattresses'],
          mattressType: [],
          preferences: [],
          functions: [],
          weightCategory: [],
        },
        fromHardnessShortcut: level.id,
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

  if (hardnessLevels.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hardnessLevels.map((level) => (
          <div
            key={level.id}
            onClick={() => handleSelect(level)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(level);
              }
            }}
            aria-label={`Выбрать матрасы ${level.name.toLowerCase()}`}
          >
            <div>
              <h3 className="font-medium">{level.name}</h3>
              <p className="text-sm text-gray-600">{level.description}</p>
              {/* Hardness level circles */}
              <div className="flex items-center space-x-1 mt-2">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full border ${
                      index < level.level 
                        ? 'bg-teal-500 border-teal-500' 
                        : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <ChevronRight size={20} className="ml-auto text-gray-400" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HardnessLevels;