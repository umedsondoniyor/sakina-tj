import React from 'react';
import { Phone, ShoppingCart } from 'lucide-react';
import Logo from '../Logo';
import { useCart } from '../../contexts/CartContext';

interface MobileHeaderProps {
  isCatalogOpen: boolean;
  onToggleCatalog: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ isCatalogOpen, onToggleCatalog }) => {
  const { items, setIsOpen } = useCart();

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
      {/* Catalog toggle */}
      <button
        onClick={onToggleCatalog}
        className="catalog-button text-gray-600 hover:text-brand-turquoise"
        aria-label={isCatalogOpen ? 'Закрыть каталог' : 'Открыть каталог'}
      >
        <div className={`hamburger-icon ${isCatalogOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Logo */}
      <a href="/" aria-label="На главную">
        <Logo variant="horizontal" className="-my-2" />
      </a>

      {/* Actions: phone + cart */}
      <div className="flex items-center space-x-4">
        <a
          href="tel:+992905339595"
          className="text-gray-600 hover:text-brand-turquoise"
          aria-label="Позвонить нам"
        >
          <Phone size={24} />
        </a>

        {/* Cart */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative text-gray-600 hover:text-brand-turquoise"
          aria-label="Открыть корзину"
        >
          <ShoppingCart size={24} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] leading-none w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileHeader;
