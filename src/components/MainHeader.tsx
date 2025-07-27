import React, { useState, useEffect } from 'react';
import CatalogMenu from './CatalogMenu';
import MobileHeader from './header/MobileHeader';
import DesktopHeader from './header/DesktopHeader';

const MainHeader = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.catalog-menu') && !target.closest('.catalog-button')) {
        setIsCatalogOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCatalog = () => {
    setIsCatalogOpen(!isCatalogOpen);
  };

  return (
    <>
      <MobileHeader 
        isCatalogOpen={isCatalogOpen}
        onToggleCatalog={toggleCatalog}
      />
      
      <DesktopHeader 
        isCatalogOpen={isCatalogOpen}
        onToggleCatalog={toggleCatalog}
      />

      <CatalogMenu isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </>
  );
};

export default MainHeader;