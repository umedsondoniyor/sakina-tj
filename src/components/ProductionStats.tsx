import React from 'react';
import StatItem from './stats/StatItem';

interface StatItem {
  image: string;
  number: string;
  label: string;
}

const stats: StatItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80',
    number: '6000',
    label: 'матрасов'
  },
  {
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    number: '1000',
    label: 'кроватей'
  },
  {
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
    number: '5000',
    label: 'подушек'
  },
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    number: '500',
    label: 'диванов'
  }
];

const ProductionStats = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
        {/* Text Section */}
        <div className="md:col-span-2">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ежедневно производим</h2>
          <p className="text-gray-600">
            Sakina — крупнейший в России и Восточной Европе производитель и ритейлер товаров для здорового сна. 
            Собственное производство позволяет оптимизировать стоимость и контролировать каждый этап выпускаемой продукции, 
            обеспечивая потребительский спрос качественным предложением.
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="md:col-span-3 grid grid-cols-2 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionStats;