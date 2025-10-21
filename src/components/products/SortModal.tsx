import React from 'react';
import { X } from 'lucide-react';

interface SortModalProps {
  showSortModal: boolean;
  onClose: () => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
}

const sortOptions = [
  { value: 'popularity', label: 'По популярности' },
  { value: 'price-desc', label: 'По убыванию цены' },
  { value: 'price-asc', label: 'По возрастанию цены' },
  { value: 'in-stock', label: 'По наличию' },
  { value: 'discount', label: 'По скидке' },
  { value: 'new', label: 'По новизне' },
  { value: 'rating', label: 'По рейтингу' },
  // { value: 'reviews', label: 'По количеству отзывов' },
  { value: 'promo', label: 'Акция' }
];

const SortModal: React.FC<SortModalProps> = ({
  showSortModal,
  onClose,
  sortBy,
  setSortBy
}) => {
  if (!showSortModal) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Сортировка</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="py-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`w-full px-4 py-3 text-left ${
                sortBy === option.value ? 'text-teal-600' : 'text-gray-700'
              }`}
              onClick={() => {
                setSortBy(option.value);
                onClose();
              }}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="float-right text-teal-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortModal;