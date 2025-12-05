import React from 'react';
import { ShoppingCart } from 'lucide-react';
import Logo from '../Logo';
import SearchBar from './SearchBar';
import NavigationMenu from './NavigationMenu';
import { useCart } from '../../contexts/CartContext';

interface DesktopHeaderProps {
  isCatalogOpen: boolean;
  onToggleCatalog: () => void;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ isCatalogOpen, onToggleCatalog }) => {
  const { items, setIsOpen } = useCart();

  return (
    <header className="hidden md:block sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/">
              <Logo variant="horizontal" className="-my-2" />
            </a>
            <button
              onClick={onToggleCatalog}
              className="catalog-button flex items-center bg-brand-turquoise text-white px-4 py-2 rounded-lg hover:bg-brand-navy transition-colors"
            >
              <div className={`pr-6 hamburger-icon ${isCatalogOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="ml-2">Каталог</span>
            </button>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsOpen(true)}
              className="hover:text-brand-turquoise relative"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <NavigationMenu />
      </div>
    </header>
  );
};

export default DesktopHeader;