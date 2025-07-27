import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { CustomerReview } from '../../lib/types';

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = '/images/placeholder-review.jpg';
  };

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
                onError={handleImageError}
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

export default MediaModal;