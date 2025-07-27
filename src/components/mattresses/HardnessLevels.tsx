import React from 'react';
import { ChevronRight } from 'lucide-react';

interface HardnessLevel {
  id: string;
  name: string;
  description: string;
  level: number;
}

const hardnessLevels: HardnessLevel[] = [
  {
    id: 'soft',
    name: 'МЯГКИЕ',
    description: 'Для тех, кто предпочитает комфорт',
    level: 2
  },
  {
    id: 'medium',
    name: 'СРЕДНЕЙ ЖЕСТКОСТИ',
    description: 'Универсальный выбор',
    level: 3
  },
  {
    id: 'firm',
    name: 'ЖЕСТКИЕ',
    description: 'Для поддержки позвоночника',
    level: 4
  }
];

const HardnessLevels = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">По жесткости</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hardnessLevels.map((filter) => (
          <div
            key={filter.id}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-colors"
          >
            <div>
              <h3 className="font-medium">{filter.name}</h3>
              <p className="text-sm text-gray-600">{filter.description}</p>
              {/* Hardness level circles */}
              <div className="flex items-center space-x-1 mt-2">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full border ${
                      index < filter.level 
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