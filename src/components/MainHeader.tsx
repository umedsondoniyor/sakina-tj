import React, { useState, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Phone,
  BedDouble,
  Sofa,
  RockingChair,
  Earth,
  Users,
} from 'lucide-react';
import CatalogMenu from './CatalogMenu';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../contexts/CartContext';

const searchTerms = ['матрас Sakina', 'кровать Sakina', 'подушка Sakina'];

const menuItems = [
  {
    id: 'mattresses',
    title: 'Матрасы',
    icon: BedDouble,
    hasIcon: true,
  },
  {
    id: 'beds',
    title: 'Кровать',
    icon: Sofa,
    hasIcon: true,
  },
  {
    id: 'smartchair',
    title: 'Массажное кресло',
    icon: RockingChair,
    hasIcon: false,
  },
  {
    id: 'map',
    title: 'Карта',
    icon: Earth,
    hasIcon: true,
  },
];

const regularMenuItems = ['О нас'];

const MainHeader = () => {
  const { items, setIsOpen } = useCart();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(200 - Math.random() * 100);

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text, isDeleting, placeholderIndex]);

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

  const tick = () => {
    let currentTerm = searchTerms[placeholderIndex];
    let updatedText = isDeleting
      ? text.substring(0, text.length - 1)
      : currentTerm.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(100);
    }

    if (!isDeleting && updatedText === currentTerm) {
      setIsDeleting(true);
      setDelta(2000);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % searchTerms.length);
      setDelta(500);
    }
  };

  const toggleCatalog = () => {
    setIsCatalogOpen(!isCatalogOpen);
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <button
          onClick={toggleCatalog}
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
          <a href="/cart" className="text-gray-600 hover:text-brand-turquoise">
            <ShoppingCart size={24} />
          </a>
        </div>
      </div>

      {/* Desktop View */}
      <header className="hidden md:block sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <a href="/">
                <Logo variant="horizontal" className="-my-2" />
              </a>
              <button
                onClick={toggleCatalog}
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
              <div className="relative">
                <input
                  type="text"
                  placeholder={text || 'Поиск'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={20}
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* <button className="hover:text-brand-turquoise">
                <User size={24} />
              </button> */}
              <button className="hover:text-brand-turquoise">
                <Heart size={24} />
              </button>
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

          <nav className="mt-4">
            <ul className="flex justify-between w-full">
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center space-x-2"
                >
                  {item.hasIcon ? (
                    <item.icon size={32} className="text-brand-turquoise" />
                  ) : (
                    <img
                      src="/icons/filledSmartChair.png"
                      alt="Клуб Askona"
                      className="w-8 h-8 text-brand-turquoise"
                    />
                  )}
                  <a
                    href={`/products?category=${item.id}`}
                    className="text-gray-700 hover:text-brand-turquoise"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
              {regularMenuItems.map((item) => (
                <li key={item} className="flex">
                  <Users size={24} className="text-brand-turquoise mr-1" />
                  <a href="#" className="text-gray-700 hover:text-brand-turquoise">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <CatalogMenu isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </>
  );
};

export default MainHeader;