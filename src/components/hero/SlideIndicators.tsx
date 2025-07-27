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
    <div className="flex justify-center items-center space-x-1.5 py-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => handleSlideClick(index)}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            index === currentSlide ? 'bg-teal-500' : 'bg-gray-300'
          } hover:bg-teal-400`}
        />
      ))}
    </div>
  );
};

export default SlideIndicators;