import React from "react";
import type { MattressQuickSize } from "../../lib/mattressQuickSizes";
import { formatMattressQuickSizeLabel } from "../../lib/mattressQuickSizes";

interface QuickFiltersProps {
  selectedCategories: string[];
  /** Unique sizes from mattress variants (e.g. from products). */
  mattressSizes: MattressQuickSize[];
  activeSize: string | null;
  onSelectSize: (payload: { label: string; width: number; length: number }) => void;
  onOpenMattressWizard?: () => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  selectedCategories,
  mattressSizes,
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
          {/* Online mattress quiz */}
          <button
            type="button"
            onClick={() => onOpenMattressWizard?.()}
            className="flex-none px-4 py-2 bg-yellow-100 rounded-full text-sm whitespace-nowrap hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
          >
            Онлайн-подбор матраса
          </button>

          {/* Size quick filters — sizes come from product variants */}
          {mattressSizes.map(({ width, length }) => {
            const label = formatMattressQuickSizeLabel(width, length);
            const isActive = activeSize === label;
            return (
              <button
                key={`${width}-${length}`}
                type="button"
                onClick={() => onSelectSize({ label, width, length })}
                className={[
                  "flex-none px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-brand-turquoise text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;
