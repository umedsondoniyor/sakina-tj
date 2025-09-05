// catalog/CategoryContent.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

type CategoryContent = {
  title: string;
  categories: { title: string; items: string[] }[];
  promos: { title: string; description: string; image: string }[];
};

export default function CategoryContent({
  content,
  onItemClick,                           // ⬅️ add
}: {
  content: CategoryContent;
  onItemClick?: (sectionTitle: string, itemLabel: string) => void; // ⬅️ add
}) {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-8 p-6">
      {/* left 3 cols: sections */}
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
        {content.categories.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold mb-3">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((label) => (
                <button
                  key={label}
                  onClick={() => onItemClick?.(section.title, label)}  // ⬅️ call back
                  className="w-full text-left flex items-center justify-between text-gray-700 hover:text-teal-600"
                >
                  <span>{label}</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* right col: promos — unchanged */}
      <div className="hidden md:block">
        {/* ... your promo card(s) ... */}
      </div>
    </div>
  );
}
