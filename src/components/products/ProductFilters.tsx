import React from 'react';

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
  // IMPORTANT: allow functional updates
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
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
  // ⚠️ Remove the effect that mirrors categories back to parent.
  // Parent already syncs productType when selectedCategories change.

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 w-64 flex-shrink-0 border-gray-200 pr-8">
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
                  className="rounded text-teal-600 focus:ring-teал-500 w-4 h-4"
                />
                <span className={`text-sm ${selectedCategories.includes(value) ? 'font-semibold text-teal-600' : 'text-gray-700'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Age (for mattresses / or when none selected) */}
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
                      setFilters(prev => ({
                        ...prev,
                        age: e.target.checked
                          ? [...prev.age, option.value]
                          : prev.age.filter(a => a !== option.value)
                      }));
                    }}
                    className="rounded text-teal-600 focus:ring-teал-500"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}


        {/* Hardness */}
        <div>
          <h3 className="font-medium mb-3">Жесткость</h3>
          <div className="space-y-2">
            {['Жесткий', 'Средняя', 'Мягкий', 'Разная жесткость сторон'].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hardness.includes(option)}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      hardness: e.target.checked
                        ? [...prev.hardness, option]
                        : prev.hardness.filter(h => h !== option)
                    }))
                  }
                  className="rounded text-teal-600 focus:ring-teал-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Weight Category (mattresses) */}
        {(selectedCategories.includes('mattresses') || selectedCategories.length === 0) && (
          <div>
            <h3 className="font-medium mb-3">Весовая категория</h3>
            <div className="space-y-2">
              {[
                { value: '50-85 kg (Soft)', label: '50-85 kg (Мягкая)' },
                { value: '85-100 kg (Medium)', label: '85-100 kg (Средняя)' },
                { value: '100+ kg (Hard)', label: '100+ kg (Жесткая)' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.weightCategory.includes(option.value)}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        weightCategory: e.target.checked
                          ? [...prev.weightCategory, option.value]
                          : prev.weightCategory.filter(w => w !== option.value)
                      }))
                    }
                    className="rounded text-teal-600 focus:ring-teал-500"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Width / Length / Height / Price – wire up when ready */}
        <div>
          <h3 className="font-medium mb-3">Ширина, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setFilters(prev => ({ ...prev, width: [v, prev.width?.[1] ?? 10000] }));
              }}
            />
            <input
              type="number"
              placeholder="до"
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || 10000;
                setFilters(prev => ({ ...prev, width: [prev.width?.[0] ?? 0, v] }));
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Длина, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setFilters(prev => ({ ...prev, length: [v, prev.length?.[1] ?? 10000] }));
              }}
            />
            <input
              type="number"
              placeholder="до"
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || 10000;
                setFilters(prev => ({ ...prev, length: [prev.length?.[0] ?? 0, v] }));
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Высота, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setFilters(prev => ({ ...prev, height: [v, prev.height?.[1] ?? 10000] }));
              }}
            />
            <input
              type="number"
              placeholder="до"
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || 10000;
                setFilters(prev => ({ ...prev, height: [prev.height?.[0] ?? 0, v] }));
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Цена, c.</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="от"
              className="w-24 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setFilters(prev => ({ ...prev, price: [v, prev.price?.[1] ?? Number.MAX_SAFE_INTEGER] }));
              }}
            />
            <input
              type="number"
              placeholder="до"
              className="w-24 px-2 py-1 border rounded"
              onChange={(e) => {
                const v = Number(e.target.value) || Number.MAX_SAFE_INTEGER;
                setFilters(prev => ({ ...prev, price: [prev.price?.[0] ?? 0, v] }));
              }}
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
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      mattressType: e.target.checked
                        ? [...prev.mattressType, option]
                        : prev.mattressType.filter(t => t !== option)
                    }))
                  }
                  className="rounded text-teal-600 focus:ring-teал-500"
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
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      preferences: e.target.checked
                        ? [...prev.preferences, option]
                        : prev.preferences.filter(p => p !== option)
                    }))
                  }
                  className="rounded text-teal-600 focus:ring-teал-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Functions */}
        <div>
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
