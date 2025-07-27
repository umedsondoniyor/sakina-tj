import React from 'react';
import { Phone } from 'lucide-react';
import Logo from '../Logo';

interface MobileHeaderProps {
  isCatalogOpen: boolean;
  onToggleCatalog: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ isCatalogOpen, onToggleCatalog }) => {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
      <button
        onClick={onToggleCatalog}
        className="catalog-button text-gray-600 hover:text-brand-turquoise"
      >
        <div className={`hamburger-icon ${isCatalogOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <a href="/">
        <Logo variant="horizontal" className="-my-2" />
      </a>

      <div className="flex items-center space-x-4">
        <a
          href="tel:88002004090"
          className="text-gray-600 hover:text-brand-turquoise"
        >
          <Phone size={24} />
        </a>
      </div>
    </div>
  );
};

export default MobileHeader;