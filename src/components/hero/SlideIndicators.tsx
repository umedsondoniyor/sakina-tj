import React from 'react';

interface SlideIndicatorsProps {
  totalSlides: number;
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onStartAutoPlay: () => void;
}

const SlideIndicators: React.FC<SlideIndicatorsProps> = ({
  totalSlides,
  currentSlide,
  onSlideChange,
  onStartAutoPlay
}) => {
  const handleSlideClick = (index: number) => {
    onSlideChange(index);
    onStartAutoPlay();
  };

  return (
    <div className="flex justify-center items-center space-x-2 py-3">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => handleSlideClick(index)}
          className={`
            rounded-full transition-colors
            w-2 h-2 md:w-3 md:h-3
            ${index === currentSlide ? 'bg-brand-turquoise' : 'bg-gray-300'}
            hover:bg-teal-400
          `}
          aria-label={`Перейти к слайду ${index + 1}`}
          aria-current={index === currentSlide ? 'true' : 'false'}
        />
      ))}
    </div>
  );
};

export default SlideIndicators;
