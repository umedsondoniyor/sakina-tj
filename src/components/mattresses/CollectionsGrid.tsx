import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface Collection {
  id: string;
  title: string;
  description: string;
  image_url: string;
  collection_type: string;
  price_min: number | null;
  price_max: number | null;
  preferences: string[] | null;
}

interface CollectionsGridProps {
  sectionTitle?: string;
  viewAllButtonText?: string;
}

const CollectionsGrid = ({ sectionTitle = 'По коллекции', viewAllButtonText = 'Смотреть все матрасы' }: CollectionsGridProps) => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('mattress_collections')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error loading collections:', error);
          return;
        }

        if (data) {
          setCollections(data as Collection[]);
          console.log('Loaded collections:', data.length);
        } else {
          console.warn('No collections data returned');
        }
      } catch (e) {
        console.error('Error loading collections:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCollectionClick = (collection: Collection) => {
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

    // Apply price filters if available
    if (collection.price_min !== null || collection.price_max !== null) {
      filters.price = [
        collection.price_min ?? 0,
        collection.price_max ?? -1, // -1 means no upper limit
      ];
    }

    // Apply preferences if available
    if (collection.preferences && collection.preferences.length > 0) {
      filters.preferences = collection.preferences;
    }

    navigate('/products', {
      state: {
        selectedCategories: ['mattresses'],
        filters,
        fromCollection: collection.collection_type,
      },
    });
  };

  const handleViewAll = () => {
    navigate('/products', {
      state: {
        selectedCategories: ['mattresses'],
        filters: {
          age: [],
          hardness: [],
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
      },
    });
  };

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div
            key={collection.id}
            onClick={() => handleCollectionClick(collection)}
            className="group cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCollectionClick(collection);
              }
            }}
            aria-label={`Посмотреть коллекцию ${collection.title}`}
          >
            <div className="relative rounded-lg overflow-hidden mb-4">
              <img
                src={collection.image_url}
                alt={collection.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x200/e5e7eb/9ca3af?text=Collection';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/50 transition-colors"></div>
            </div>
            <h3 className="font-bold mb-2 group-hover:text-teal-600 transition-colors">
              {collection.title}
            </h3>
            <p className="text-sm text-gray-600">{collection.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button
          onClick={handleViewAll}
          className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition-colors font-medium"
          aria-label={viewAllButtonText}
        >
          {viewAllButtonText}
        </button>
      </div>
    </section>
  );
};

export default CollectionsGrid;