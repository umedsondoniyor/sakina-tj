import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CategoryMenuItemProps {
  item: {
    id: string;
    name: string;
    icon: React.ElementType;
  };
  isSelected: boolean;
  onCategoryClick: (categoryId: string) => void;
  onCategoryHover: (categoryId: string) => void;
  onCategoryLeave: () => void;
}

const CategoryMenuItem: React.FC<CategoryMenuItemProps> = ({
  item,
  isSelected,
  onCategoryClick,
  onCategoryHover,
  onCategoryLeave
}) => {
  return (
    <button
      onClick={() => onCategoryClick(item.id)}
      onMouseEnter={() => onCategoryHover(item.id)}
      onMouseLeave={onCategoryLeave}
      className={`flex items-center justify-between w-full px-4 py-2 text-left hover:text-teal-600 ${
        isSelected ? 'text-teal-600 bg-gray-50' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <item.icon size={20} className="text-gray-400" />
        <span>{item.name}</span>
      </div>
      <ChevronRight size={20} />
    </button>
  );
};

export default CategoryMenuItem;