import React from 'react';
import type { CarouselSlide } from '../../lib/types';

interface HeroSlideProps {
  slide: CarouselSlide;
  isActive: boolean;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ slide, isActive }) => {
  const imagePriority = { fetchpriority: isActive ? 'high' : 'auto' } as Record<string, string>;
  const slideAlt = slide.title?.trim()
    ? `Баннер Sakina: ${slide.title}`
    : 'Главный баннер Sakina';

  return (
    <div
      className={`relative float-left -mr-[100%] w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
    >
      <div className="relative w-full mx-auto">
        <img
          src={slide.image_url}
          alt={slideAlt}
          className="hero-image mx-auto w-full h-auto object-cover block"
          loading={isActive ? 'eager' : 'lazy'}
          {...imagePriority}
          decoding="async"
          width="1920"
          height="960"
        />
      </div>
    </div>
  );
};

export default HeroSlide;
