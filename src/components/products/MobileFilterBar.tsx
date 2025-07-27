import React from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface MobileFilterBarProps {
  onShowFilters: () => void;
  onShowSort: () => void;
  sortBy: string;
}

const sortOptions = [
  { value: 'popularity', label: 'По популярности' },
  { value: 'price-desc', label: 'По убыванию цены' },
  { value: 'price-asc', label: 'По возрастанию цены' },
  { value: 'in-stock', label: 'По наличию' },
  { value: 'discount', label: 'По скидке' },
  { value: 'new', label: 'По новизне' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'reviews', label: 'По количеству отзывов' },
  { value: 'promo', label: 'Акция' }
];

const MobileFilterBar: React.FC<MobileFilterBarProps> = ({
  onShowFilters,
  onShowSort,
  sortBy
}) => {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-t border-b">
      <button
        onClick={onShowFilters}
        className="flex items-center space-x-2 text-gray-700"
      >
        <SlidersHorizontal size={20} />
        <span>Фильтр</span>
      </button>
      
      <button
        onClick={onShowSort}
        className="flex items-center space-x-2 text-gray-700"
      >
        <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
        <ChevronDown size={20} />
      </button>
    </div>
  );
};

export default MobileFilterBar;