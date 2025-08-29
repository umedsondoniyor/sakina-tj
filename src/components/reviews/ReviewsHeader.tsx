import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewsHeaderProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollTo: (direction: 'left' | 'right') => void;
}

const baseBtn =
  "p-2 rounded-full transition-colors flex items-center justify-center";

const ReviewsHeader: React.FC<ReviewsHeaderProps> = ({
  canScrollLeft,
  canScrollRight,
  onScrollTo,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-brand-navy">
        Отзывы и фото покупателей
      </h2>
      <div className="hidden md:flex space-x-2">
        {/* LEFT BUTTON */}
        <button
          type="button"
          onClick={() => onScrollTo('left')}
          aria-disabled={!canScrollLeft}
          className={`${baseBtn} ${
            canScrollLeft
              ? 'hover:bg-gray-100 text-gray-700 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={24} />
        </button>

        {/* RIGHT BUTTON */}
        <button
          type="button"
          onClick={() => onScrollTo('right')}
          aria-disabled={!canScrollRight}
          className={`${baseBtn} ${
            canScrollRight
              ? 'hover:bg-gray-100 text-gray-700 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default ReviewsHeader;
