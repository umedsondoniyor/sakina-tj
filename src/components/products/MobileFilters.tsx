import React from 'react';
import { X } from 'lucide-react';

interface FilterState {
  age: string[];
  hardness: string[];
  width: number[];
  length: number[];
  height: number[];
  price: number[];
  inStock: boolean;
  productType: string[];
  mattressType: string[];
  preferences: string[];
  functions: string[];
}

interface MobileFiltersProps {
  showFilters: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  productsCount: number;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  showFilters,
  onClose,
  filters,
  setFilters,
  productsCount
}) => {
  if (!showFilters) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          <div className="p-4 space-y-6">
            {/* Age filters */}
            <div>
              <h3 className="font-medium mb-3">Возраст</h3>
              <div className="space-y-2">
                {[
                  { value: 'from0to3', label: '0-3 года' },
                  { value: 'from3to7', label: '3-5 лет' },
                  { value: 'from7to14', label: '5-7 лет' },
                  { value: 'from7to14', label: '7-14 лет' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.age.includes(option.value)}
                      onChange={(e) => {
                        const newAges = e.target.checked
                          ? [...filters.age, option.value]
                          : filters.age.filter(a => a !== option.value);
                        setFilters({ ...filters, age: newAges });
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hardness filters */}
            <div>
              <h3 className="font-medium mb-3">Жесткость</h3>
              <div className="space-y-2">
                {['Жесткий', 'Средняя', 'Мягкий', 'Разная жесткость сторон'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.hardness.includes(option)}
                      onChange={(e) => {
                        const newHardness = e.target.checked
                          ? [...filters.hardness, option]
                          : filters.hardness.filter(h => h !== option);
                        setFilters({ ...filters, hardness: newHardness });
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-medium mb-3">Наличие</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Только в наличии</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button 
            className="w-full bg-teal-500 text-white py-3 rounded-lg"
            onClick={onClose}
          >
            Показать {productsCount} товаров
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;