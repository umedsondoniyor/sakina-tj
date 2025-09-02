import React from 'react';
import type { CarouselSlide } from '../../lib/types';

interface HeroSlideProps {
  slide: CarouselSlide;
  isActive: boolean;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ slide, isActive }) => {
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
          alt={slide.title}
          className="hero-image mx-auto"
        />
      </div>
    </div>
  );
};

export default HeroSlide;
