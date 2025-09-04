// src/components/mattresses/MattressTypeGrid.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MattressType {
  id: 'double' | 'single' | 'children' | 'rolled';
  name: string;
  image: string;
}

const mattressTypes: MattressType[] = [
  {
    id: 'double',
    name: 'Двуспальные',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/dvuhspal_v2.png'
  },
  {
    id: 'single',
    name: 'Односпальные',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/odnospal_v2.png'
  },
  {
    id: 'children',
    name: 'Детские',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/detskie_v2.png'
  },
  {
    id: 'rolled',
    name: 'Топер для матраса',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/namatrasy_v2.png'
  }
];

const MattressTypeGrid: React.FC = () => {
  const navigate = useNavigate();

  // Map each tile → pre-applied filters for ProductsPage
  const handleSelect = (typeId: MattressType['id']) => {
    // Always land in the mattresses catalog
    const selectedCategories = ['mattresses'] as string[];

    // Build filter payload that your ProductsPage understands.
    // Note: ProductsPage currently filters by: productType (categories), hardness, weightCategory, inStock
    // We’ll also pass width/length/preferences/mattressType for future use; they’re harmless if ignored.
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

    switch (typeId) {
      case 'double':
        // Typical double widths ≥ 140cm
        filters = { ...filters, width: [140, 200] };
        break;
      case 'single':
        // Typical single widths ≤ 120cm
        filters = { ...filters, width: [70, 120] };
        break;
      case 'children':
        // Children targeting + keep broad ages (ProductsPage may adopt these later)
        filters = {
          ...filters,
          age: ['from0to3', 'from3to7', 'from7to14'],
          preferences: ['Для детей и подростков'],
        };
        break;
      case 'rolled':
        // Rolled mattresses / toppers
        filters = {
          ...filters,
          mattressType: ['В скрутке'],
        };
        break;
    }

    navigate('/products', {
      state: {
        selectedCategories,
        filters,
        // (Optional) a hint so you can show a chip/banner on ProductsPage:
        fromTypeShortcut: typeId,
      },
    });
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">По типу</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mattressTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => handleSelect(type.id)}
            className="text-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
            aria-label={`Показать матрасы: ${type.name}`}
          >
            <div className="mx-auto mb-3 overflow-hidden bg-gray-100 ">
              <img
                src={type.image}
                alt={type.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm font-medium group-hover:text-teал-600 transition-colors">
              {type.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MattressTypeGrid;
