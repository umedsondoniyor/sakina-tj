// src/components/ProductFilters.tsx
import React from 'react';

interface FilterState {
  age: string[];
  hardness: string[];
  width: number[];   // [min, max] or []
  length: number[];  // [min, max] or []
  height: number[];  // [min, max] or []
  price: number[];   // [min, max] or []
  inStock: boolean;
  productType: string[];
  mattressType: string[];
  preferences: string[];
  functions: string[];
  weightCategory: string[];
}

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedCategories: string[];
  onCategoryChange: (categoryValue: string, isChecked: boolean) => void;
  onClearFilters: () => void;
  categoryDisplayNames: Record<string, string>;
}

const numberOrUndefined = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== '' ? n : undefined;
};

const upsertRange = (prev: number[], idx: 0 | 1, value?: number): number[] => {
  const next: (number | undefined)[] = [prev?.[0], prev?.[1]];
  next[idx] = value;
  const min = next[0];
  const max = next[1];
  if (min == null && max == null) return [];
  // DON'T auto-swap - let users type freely, they're still typing!
  // Keep actual values, use -1 as sentinel for "not set"
  return [min ?? -1, max ?? -1];
};

const getInputValue = (range: number[], idx: 0 | 1) => {
  if (!range?.length) return '';
  const val = range[idx];
  if (val === -1) return ''; // -1 means "not set"
  return String(val);
};

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  setFilters,
  selectedCategories,
  onCategoryChange,
  onClearFilters,
  categoryDisplayNames,
}) => {
  const showMattressOnly =
    selectedCategories.includes('mattresses') || selectedCategories.length === 0;

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
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span
                  className={`text-sm ${
                    selectedCategories.includes(value)
                      ? 'font-semibold text-teal-600'
                      : 'text-gray-700'
                  }`}
                >
                  {label}
                </span>
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
              onChange={(e) => setFilters((p) => ({ ...p, inStock: e.target.checked }))}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Только в наличии</span>
          </label>
        </div>

        {/* Age (only for mattresses / or when none selected) */}
        {showMattressOnly && (
          <div>
            <h3 className="font-medium mb-3">Возраст</h3>
            <div className="space-y-2">
              {[
                { value: 'from0to3', label: '0-3 года' },
                { value: 'from3to7', label: '3-7 лет' },
                { value: 'from7to14', label: '7-14 лет' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.age.includes(opt.value)}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        age: e.target.checked
                          ? [...p.age, opt.value]
                          : p.age.filter((a) => a !== opt.value),
                      }))
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Hardness */}
        <div>
          <h3 className="font-medium mb-3">Жесткость</h3>
          <div className="space-y-2">
            {['Жесткий', 'Средняя', 'Мягкий', 'Разная жесткость сторон'].map((opt) => (
              <label key={opt} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hardness.includes(opt)}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      hardness: e.target.checked
                        ? [...p.hardness, opt]
                        : p.hardness.filter((h) => h !== opt),
                    }))
                  }
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Weight Category (mattresses) */}
        {showMattressOnly && (
          <div>
            <h3 className="font-medium mb-3">Весовая категория</h3>
            <div className="space-y-2">
              {[
                { value: '50-85 kg (Soft)', label: '50-85 kg (Мягкая)' },
                { value: '85-100 kg (Medium)', label: '85-100 kg (Средняя)' },
                { value: '100+ kg (Hard)', label: '100+ kg (Жесткая)' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.weightCategory.includes(opt.value)}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        weightCategory: e.target.checked
                          ? [...p.weightCategory, opt.value]
                          : p.weightCategory.filter((w) => w !== opt.value),
                      }))
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Width */}
        <div>
          <h3 className="font-semibold mb-3">Ширина, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="от"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.width, 0)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, width: upsertRange(p.width, 0, v) }));
              }}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="до"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.width, 1)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, width: upsertRange(p.width, 1, v) }));
              }}
            />
          </div>
        </div>

        {/* Length */}
        <div>
          <h3 className="font-semibold mb-3">Длина, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="от"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.length, 0)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, length: upsertRange(p.length, 0, v) }));
              }}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="до"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.length, 1)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, length: upsertRange(p.length, 1, v) }));
              }}
            />
          </div>
        </div>

        {/* Height */}
        <div>
          <h3 className="font-semibold mb-3">Высота, см</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="от"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.height, 0)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, height: upsertRange(p.height, 0, v) }));
              }}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="до"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.height, 1)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, height: upsertRange(p.height, 1, v) }));
              }}
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <h3 className="font-medium mb-3">Цена, c.</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="от"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.price, 0)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, price: upsertRange(p.price, 0, v) }));
              }}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="до"
              className="w-24 px-3 py-2 border rounded"
              value={getInputValue(filters.price, 1)}
              onChange={(e) => {
                const v = numberOrUndefined(e.target.value);
                setFilters((p) => ({ ...p, price: upsertRange(p.price, 1, v) }));
              }}
            />
          </div>
        </div>

        <button onClick={onClearFilters} className="text-teal-600 hover:text-teal-700">
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;