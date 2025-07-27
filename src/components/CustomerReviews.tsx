import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, X, PackageOpen } from 'lucide-react';
import { getCustomerReviews } from '../lib/api';
import type { CustomerReview } from '../lib/types';

interface MediaModalProps {
  review: CustomerReview;
  onClose: () => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ review, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-[450px] mt-12">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        <div className="bg-white rounded-xl overflow-hidden">
          {review.type === 'video' ? (
            <div className="relative pb-[177.77%] h-0">
              <iframe
                src={`${review.instagram_url}/embed`}
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-square">
              <img
                src={review.image_url}
                alt={review.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/placeholder-review.jpg';
                }}
              />
            </div>
          )}
          
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <a
                href={review.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-turquoise hover:text-teal-700"
                onClick={(e) => e.stopPropagation()}
              >
                {review.username}
              </a>
            </div>
            {review.description && (
              <p className="mt-2 text-brand-navy">{review.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getCustomerReviews();
      setReviews(data);
    } catch (err) {
      setError('Failed to load customer reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateScrollProgress = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < maxScroll);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollProgress);
      updateScrollProgress();
      return () => container.removeEventListener('scroll', updateScrollProgress);
    }
  }, []);

  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-none w-[300px] space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{error}</h3>
          <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
          <button
            onClick={loadReviews}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No reviews available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for customer reviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-brand-navy">Отзывы и фото покупателей</h2>
        <div className="hidden md:flex space-x-2">
          <button
            onClick={() => scrollTo('left')}
            className={`p-2 rounded-full transition-colors ${
              canScrollLeft ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scrollTo('right')}
            className={`p-2 rounded-full transition-colors ${
              canScrollRight ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={!canScrollRight}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex-none w-[300px] cursor-pointer group"
              onClick={() => setSelectedReview(review)}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={review.image_url}
                  alt={review.username}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/images/placeholder-review.jpg';
                  }}
                />
                {review.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <Play size={48} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <a
                  href={review.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-navy hover:text-brand-turquoise"
                  onClick={(e) => e.stopPropagation()}
                >
                  {review.username}
                </a>
                {review.description && (
                  <p className="mt-1 text-sm text-brand-navy line-clamp-2">{review.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Progress Bar */}
        <div className="h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden md:hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {selectedReview && (
        <MediaModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}
    </div>
  );
};

export default CustomerReviews;