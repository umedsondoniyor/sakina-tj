import React from 'react';
import type { CarouselSlide } from '../../lib/types';

interface HeroSlideProps {
  slide: CarouselSlide;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ slide }) => {
  return (
    // parent provides a relative aspect-ratio box
    <img
      src={slide.image_url}
      alt={slide.title}
      className="absolute inset-0 w-full h-full object-cover select-none hero-image"
      draggable={false}
      decoding="async"
      loading="eager"
    />
  );
};

export default HeroSlide;
