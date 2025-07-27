import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PopularFilter {
  id: string;
  name: string;
  description: string;
  image: string;
}

const popularFilters: PopularFilter[] = [
  {
    id: 'orthopedic',
    name: 'Ортопедические',
    description: 'Для здоровья позвоночника',
    image: 'https://i.askona.ru/upload/iblock/c47/c479e7185286f1c8da079aefe6261bd9.svg'
  },
  {
    id: 'independent-springs',
    name: 'Независимый пружинный блок',
    description: 'Индивидуальная поддержка',
    image: 'https://i.askona.ru/upload/iblock/784/78420d3ebf9d96a1f11555650042288d.svg'
  },
  {
    id: 'children',
    name: 'Для малышей',
    description: 'Безопасные материалы',
    image: 'https://i.askona.ru/upload/iblock/784/78420d3ebf9d96a1f11555650042288d.svg'
  }
];

const PopularFilters = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Популярные фильтры</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popularFilters.map((filter) => (
          <div
            key={filter.id}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-colors"
          >
            <img
              className="w-16 h-16 object-cover group-hover:scale-105 transition-transform mr-4"
              src={filter.image}
              alt={filter.name}
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