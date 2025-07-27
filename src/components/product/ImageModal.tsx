import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  images, 
  currentIndex, 
  onClose, 
  onPrevious, 
  onNext 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
      >
        <X size={24} />
      </button>
      
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={32} />
      </button>

      <img
        src={images[currentIndex]}
        alt={`Product view ${currentIndex + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain"
      />

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

export default ImageModal;