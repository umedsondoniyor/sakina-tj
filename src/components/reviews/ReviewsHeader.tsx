import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewsHeaderProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollTo: (direction: 'left' | 'right') => void;
}

const ReviewsHeader: React.FC<ReviewsHeaderProps> = ({
  canScrollLeft,
  canScrollRight,
  onScrollTo
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-brand-navy">Отзывы и фото покупателей</h2>
      <div className="hidden md:flex space-x-2">
        {/* LEFT: keep clickable even when visually “disabled” */}
        <button
          type="button"
          onClick={() => onScrollTo('left')}
          aria-disabled={!canScrollLeft}
          className={`p-2 rounded-full transition-colors relative z-10
            ${canScrollLeft ? 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                             : 'text-gray-300 opacity-60 cursor-pointer'}`}
          title={canScrollLeft ? 'Прокрутить влево' : 'В начало'}
        >
          <ChevronLeft size={24} />
        </button>

        {/* RIGHT: unchanged (native disabled keeps it non-clickable when needed) */}
        <button
          type="button"
          onClick={() => onScrollTo('right')}
          className={`p-2 rounded-full transition-colors ${
            canScrollRight ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          disabled={!canScrollRight}
          title={canScrollRight ? 'Прокрутить вправо' : 'В конец'}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default ReviewsHeader;
