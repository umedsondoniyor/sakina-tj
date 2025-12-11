import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageModal from './ImageModal';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  salePercentage?: number;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  salePercentage
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Check scroll possibilities whenever the container scrolls
  useEffect(() => {
    const checkScroll = () => {
      if (thumbnailsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = thumbnailsRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    const container = thumbnailsRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailsRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = thumbnailsRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      thumbnailsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>
      <div 
        className="relative cursor-zoom-in"
        ref={imageRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
      >
        {salePercentage && (
          <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            -{salePercentage}%
          </span>
        )}
        <span className="absolute top-4 right-4 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm">
          Выгодно
        </span>
        <img
          src={images[currentImageIndex]}
          alt={productName}
          className="w-full rounded-lg"
          loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
          fetchPriority={currentImageIndex === 0 ? 'high' : 'auto'}
          decoding="async"
          width="800"
          height="800"
        />
        {showMagnifier && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <Search className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* Thumbnails Carousel */}
      <div className="relative mt-4">
        {canScrollLeft && (
          <button
            onClick={() => scrollThumbnails('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div 
          ref={thumbnailsRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide mx-4"
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-none w-24 h-24 border rounded-lg overflow-hidden transition-colors ${
                currentImageIndex === index ? 'border-teal-500' : 'hover:border-teal-500'
              }`}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="96"
                height="96"
              />
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollThumbnails('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setShowImageModal(false)}
          onPrevious={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
          onNext={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
        />
      )}
    </div>
  );
};

export default ProductImageGallery;