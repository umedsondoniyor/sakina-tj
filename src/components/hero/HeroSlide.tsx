import React from 'react';
import type { CarouselSlide } from '../../lib/types';

interface HeroSlideProps {
  slide: CarouselSlide;
  isActive: boolean;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ slide, isActive }) => {
  // If your type has link_url, this preserves click-through on the banner.
  const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) =>
    (slide as any).link_url ? (
      <a
        href={(slide as any).link_url}
        className="block w-full h-full focus:outline-none"
        tabIndex={isActive ? 0 : -1}
        aria-label={slide.title}
      >
        {children}
      </a>
    ) : (
      <div className="w-full h-full">{children}</div>
    );

  return (
    <div
      className={`
        w-full h-full
        transition-opacity duration-500 ease-in-out
        ${isActive ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
      aria-hidden={!isActive}
    >
      <Wrapper>
        {/* 
          Parent sets the aspect ratio; we just cover the frame.
          Prevent drag/select to avoid ghost images during swipe.
        */}
        <img
          src={slide.image_url}
          alt={slide.title}
          className="w-full h-full object-cover object-center select-none"
          draggable={false}
          loading={isActive ? 'eager' : 'lazy'}
          decoding="async"
        />
      </Wrapper>
    </div>
  );
};

export default HeroSlide;
