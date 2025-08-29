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
          className="text-sm text-brand-navy hover:text-brand-turquoise flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{review.username}</span>
          <svg 
            className="w-4 h-4 ml-1 flex-shrink-0" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        {review.description && (
          <p className="mt-1 text-sm text-brand-navy line-clamp-2">{review.description}</p>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;