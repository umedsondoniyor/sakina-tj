import React from 'react';

interface CategoryAlertProps {
  selectedCategories: string[];
  categoryDisplayNames: Record<string, string>;
  onClearCategories: () => void;
}

const CategoryAlert: React.FC<CategoryAlertProps> = ({
  selectedCategories,
  categoryDisplayNames,
  onClearCategories
}) => {
  if (selectedCategories.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-teal-700">
          Показаны товары из категорий: {selectedCategories.map(cat => categoryDisplayNames[cat]).join(', ')}
        </span>
        <button
          onClick={onClearCategories}
          className="text-sm text-teal-600 hover:text-teal-800 underline"
        >
          Сбросить
        </button>
      </div>
    </div>
  );
};

export default CategoryAlert;