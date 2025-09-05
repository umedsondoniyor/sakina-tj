// products/ProductFilters.tsx
import React, { useMemo } from 'react';
import { facetsForCategories } from '../../lib/facets';

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters, setFilters, selectedCategories, onCategoryChange, onClearFilters, categoryDisplayNames
}) => {
  const activeFacets = useMemo(
    () => facetsForCategories(selectedCategories),
    [selectedCategories]
  );

  const show = (key: string) => activeFacets.includes(key as any);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 w-64 flex-shrink-0 border-gray-200 pr-8">
      <div className="space-y-6">
        {/* Category selection – unchanged */}
        {/* ... */}

        {/* In stock */}
        {show('inStock') && (
          <div>
            <h3 className="font-medium mb-3">Наличие</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Только в наличии</span>
            </label>
          </div>
        )}

        {/* Mattress-only */}
        {show('hardness') && (
          <div>
            <h3 className="font-medium mb-3">Жесткость</h3>
            {['Жесткий','Средняя','Мягкий','Разная жесткость сторон'].map(o => (
              <label key={o} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hardness.includes(o)}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      hardness: e.target.checked
                        ? [...prev.hardness, o]
                        : prev.hardness.filter(x => x !== o)
                    }))
                  }
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        )}

        {show('mattressType') && (
          <div>
            <h3 className="font-medium mb-3">Тип матраса</h3>
            {['Двусторонний','Ортопедический','Анатомический'].map(o => (
              <label key={o} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.mattressType.includes(o)}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      mattressType: e.target.checked
                        ? [...prev.mattressType, o]
                        : prev.mattressType.filter(x => x !== o)
                    }))
                  }
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        )}

        {show('weightCategory') && (
          <div>
            <h3 className="font-medium mb-3">Весовая категория</h3>
            {[
              '50-85 kg (Soft)',
              '85-100 kg (Medium)',
              '100+ kg (Hard)'
            ].map(o => (
              <label key={o} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.weightCategory.includes(o)}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      weightCategory: e.target.checked
                        ? [...prev.weightCategory, o]
                        : prev.weightCategory.filter(x => x !== o)
                    }))
                  }
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        )}

        {/* Dimensions (variants) */}
        {show('width') && (
          <RangeInputs
            label="Ширина, см"
            value={filters.width}
            onChange={(v) => setFilters(prev => ({ ...prev, width: v }))}
          />
        )}
        {show('length') && (
          <RangeInputs
            label="Длина, см"
            value={filters.length}
            onChange={(v) => setFilters(prev => ({ ...prev, length: v }))}
          />
        )}
        {show('height') && (
          <RangeInputs
            label="Высота, см"
            value={filters.height}
            onChange={(v) => setFilters(prev => ({ ...prev, height: v }))}
          />
        )}

        {/* Pillows / Furniture examples (add when you’re ready) */}
        {show('pillowHeight') && (
          <RangeInputs
            label="Высота подушки, см"
            value={filters.pillowHeight ?? []}
            onChange={(v) => setFilters(prev => ({ ...prev, pillowHeight: v }))}
          />
        )}
        {show('sizeName') && (
          <CheckboxGroup
            label="Размер"
            options={['50×70','70×70','Односпальный','Двуспальный']}
            values={filters.sizeName ?? []}
            onToggle={(val, checked) =>
              setFilters(prev => ({
                ...prev,
                sizeName: checked
                  ? [...(prev.sizeName ?? []), val]
                  : (prev.sizeName ?? []).filter(x => x !== val),
              }))
            }
          />
        )}

        {/* Price – shown for all */}
        <RangeInputs
          label="Цена, c."
          value={filters.price}
          onChange={(v) => setFilters(prev => ({ ...prev, price: v }))}
        />

        <button onClick={onClearFilters} className="text-teal-600 hover:text-teal-700">
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;

// Small helpers
function RangeInputs({
  label, value, onChange,
}: { label: string; value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div>
      <h3 className="font-medium mb-3">{label}</h3>
      <div className="flex space-x-2">
        <input
          type="number"
          placeholder="от"
          className="w-24 px-2 py-1 border rounded"
          defaultValue={value?.[0] ?? ''}
          onBlur={(e) => {
            const min = Number(e.target.value || 0);
            onChange([min, value?.[1] ?? Number.MAX_SAFE_INTEGER]);
          }}
        />
        <input
          type="number"
          placeholder="до"
          className="w-24 px-2 py-1 border rounded"
          defaultValue={value?.[1] && value[1] !== Number.MAX_SAFE_INTEGER ? value[1] : ''}
          onBlur={(e) => {
            const max = e.target.value ? Number(e.target.value) : Number.MAX_SAFE_INTEGER;
            onChange([value?.[0] ?? 0, max]);
          }}
        />
      </div>
    </div>
  );
}

function CheckboxGroup({
  label, options, values, onToggle,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (value: string, checked: boolean) => void;
}) {
  return (
    <div>
      <h3 className="font-medium mb-3">{label}</h3>
      <div className="space-y-2">
        {options.map((o) => (
          <label key={o} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={values.includes(o)}
              onChange={(e) => onToggle(o, e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
