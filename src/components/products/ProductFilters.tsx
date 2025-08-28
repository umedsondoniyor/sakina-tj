import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

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
  weightCategory: string[];
}

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  selectedCategories: string[];
  onCategoryChange: (categoryValue: string, isChecked: boolean) => void;
  onClearFilters: () => void;
  categoryDisplayNames: Record<string, string>;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  setFilters,
  selectedCategories,
  onCategoryChange,
  onClearFilters,
  categoryDisplayNames
}) => {
  // Ensure filters reflect selected categories immediately
  React.useEffect(() => {
    if (selectedCategories.length > 0) {
      setFilters(prev => ({
        ...prev,
        productType: selectedCategories
      }));
    }
  }, [selectedCategories, setFilters]);

  return (
    <div className="hidden md:block bg-gray-50 p-4 rounded-lg border-2 w-64 flex-shrink-0 border-gray-200 pr-8">
      <div className="space-y-6">
        {/* Category Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-900">Выберите категорию</h3>
          <div className="space-y-2">
            {Object.entries(categoryDisplayNames).map(([value, label]) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(value)}
                  onChange={(e) => onCategoryChange(value, e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className={`text-sm ${selectedCategories.includes(value) ? 'font-semibold text-teal-600' : 'text-gray-700'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Filter - Only for Mattresses */}
        {(selectedCategories.includes('mattresses') || selectedCategories.length === 0) && (
          <div>
            <h3 className="font-medium mb-3">Возраст</h3>
            <div className="space-y-2">
              {[
                { value: 'from0to3', label: '0-3 года' },
                { value: 'from3to7', label: '3-7 лет' },
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
        )}

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

        {/* Hardness */}
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

        {/* Weight Category - Only for Mattresses */}
        {(selectedCategories.includes('mattresses') || selectedCategories.length === 0) && (
          <div>
            <h3 className="font-medium mb-3">Весовая категория</h3>
            <div className="space-y-2">
              {['50-85 kg (Soft)', '85-100 kg (Medium)', '100+ kg (Hard)'].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.weightCategory.includes(option)}
                    onChange={(e) => {
                      const newWeightCategory = e.target.checked
                        ? [...filters.weightCategory, option]
                        : filters.weightCategory.filter(w => w !== option);
                      setFilters({ ...filters, weightCategory: newWeightCategory });
                    }}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Width */}
        <div>
          <h3 className="font-medium mb-3">Ширина, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-20 px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="до"
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>

        {/* Length */}
        <div>
          <h3 className="font-medium mb-3">Длина, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-20 px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="до"
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>

        {/* Height */}
        <div>
          <h3 className="font-medium mb-3">Высота, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-20 px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="до"
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <h3 className="font-medium mb-3">Цена, c.</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-20 px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="до"
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>

        {/* Mattress Type */}
        <div>
          <h3 className="font-medium mb-3">Вид матраса</h3>
          <div className="space-y-2">
            {['Беспружинный', 'Независимый пружинный блок', 'В скрутке'].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.mattressType.includes(option)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.mattressType, option]
                      : filters.mattressType.filter(t => t !== option);
                    setFilters({ ...filters, mattressType: newTypes });
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="font-medium mb-3">Предпочтения</h3>
          <div className="space-y-2">
            {['Для искривления Ergomotion', 'Для детей и подростков', 'Натуральные материалы'].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.preferences.includes(option)}
                  onChange={(e) => {
                    const newPrefs = e.target.checked
                      ? [...filters.preferences, option]
                      : filters.preferences.filter(p => p !== option);
                    setFilters({ ...filters, preferences: newPrefs });
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Functions */}
        <div>
          <h3 className="font-medium mb-3">Функция</h3>
          <div className="space-y-2">
            {['Защищает спальное место', 'Улучшает жесткость'].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.functions.includes(option)}
                  onChange={(e) => {
                    const newFuncs = e.target.checked
                      ? [...filters.functions, option]
                      : filters.functions.filter(f => f !== option);
                    setFilters({ ...filters, functions: newFuncs });
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={onClearFilters}
          className="text-teal-600 hover:text-teal-700"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;