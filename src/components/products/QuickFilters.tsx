import React from "react";

interface QuickFiltersProps {
  selectedCategories: string[];
  activeSize: string | null;
  onSelectSize: (payload: { label: string; width: number; length: number }) => void;
  onOpenMattressWizard?: () => void;
}

const QUICK_SIZES = [
  { label: "Матрас 160×200", width: 160, length: 200 },
  { label: "Матрас 180×200", width: 180, length: 200 },
  { label: "Матрас 140×200", width: 140, length: 200 },
  { label: "Матрас 90×200",  width: 90,  length: 200 },
];

const QuickFilters: React.FC<QuickFiltersProps> = ({
  selectedCategories,
  activeSize,
  onSelectSize,
  onOpenMattressWizard,
}) => {
  // Only show quick filters when mattresses category is selected
  if (!selectedCategories.includes("mattresses")) {
    return null;
  }

  return (
    <div className="relative mb-6">
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex space-x-3 min-w-max">
          {/* Online mattress wizard */}
          <span className="flex-none px-4 py-2 bg-yellow-100 rounded-full text-sm whitespace-nowrap hover:bg-yellow-200">
            Онлайн-подбор матраса
          </span>

          {/* Size quick filters */}
          {QUICK_SIZES.map((size) => {
            const isActive = activeSize === size.label;
            return (
              <button
                key={size.label}
                type="button"
                onClick={() => onSelectSize(size)}
                className={[
                  "flex-none px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-brand-turquoise text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200",
                ].join(" ")}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;
