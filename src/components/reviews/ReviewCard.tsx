import React from 'react';
import { Play } from 'lucide-react';
import type { CustomerReview } from '../../lib/types';

interface ReviewCardProps {
  review: CustomerReview;
  onReviewClick: (review: CustomerReview) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReviewClick }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = '/images/placeholder-review.jpg';
  };

  return (
    <div
      className="flex-none w-[300px] cursor-pointer group"
      onClick={() => onReviewClick(review)}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
        <img
          src={review.image_url}
          alt={review.username}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={handleImageError}
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
  );
};

export default ReviewCard;