import React from 'react';
import type { CarouselSlide } from '../../lib/types';

interface HeroSlideProps {
  slide: CarouselSlide;
  isActive: boolean; // kept for parity, but not used for styling here
}

const HeroSlide: React.FC<HeroSlideProps> = ({ slide }) => {
  return (
    // Parent provides absolute positioning & aspect ratio.
    <div className="w-full h-full">
      <img
        src={slide.image_url}
        alt={slide.title}
        className="w-full h-full object-cover select-none hero-image"
        draggable={false}
        decoding="async"
        loading="eager"       // carousel hero should load fast
      />
    </div>
  );
};

export default HeroSlide;
