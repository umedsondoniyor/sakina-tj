// src/layouts/PublicLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import TopHeader from '@/components/TopHeader';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

const PublicLayout: React.FC = () => {
  return (
    <>
      {/* Optional: skip link for accessibility */}
      <a href="#content" className="sr-only focus:not-sr-only">Skip to content</a>

      <TopHeader />
      <MainHeader />

      {/* Single, consistent <main> for all public pages */}
      <main id="content" className="min-h-[60vh]">
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default PublicLayout;
