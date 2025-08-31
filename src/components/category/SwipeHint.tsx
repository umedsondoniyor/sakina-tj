import React from 'react';

interface SwipeHintProps {
  showSwipeHint: boolean;
}

const SwipeHint: React.FC<SwipeHintProps> = ({ showSwipeHint }) => {
  if (!showSwipeHint) return null;

  return (
    <div className="md:hidden absolute inset-0 z-10 pointer-events-none">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-full flex items-center">
        <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm">Листайте</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-swipe" />
    </div>
  );
};

export default SwipeHint;