import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Sofa,
  RockingChair,
  Earth,
  Users,
} from 'lucide-react';

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

const regularMenuItems = [
  { title: 'О нас', link: '/about' }
];

const NavigationMenu = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // Clear any existing navigation state immediately
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    
    if (categoryId === 'mattresses') {
      // For mattresses, navigate to dedicated page
      navigate('/mattresses');
    } else {
      // For other categories, navigate to products page with immediate state
      navigate(`/products?category=${categoryId}`, { 
        replace: true,
        state: { 
          selectedCategories: ['mattresses'],
          clearOtherFilters: true 
        } 
      });
    }
  };

  return (
    <nav className="mt-4">
      <ul className="flex justify-between w-full">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-brand-turquoise transition-colors"
            onClick={(e) => handleCategoryClick(item.id, e)}
          >
            {item.hasIcon ? (
              <item.icon size={32} className="text-brand-turquoise mr-2" />
            ) : (
              <img
                src="/icons/filledSmartChair.png"
                alt="Клуб Sakina"
                className="w-8 h-8 text-brand-turquoise"
              />
            )}

            {item.title}
          </li>
        ))}
        {regularMenuItems.map((item) => (
          <li key={item.title} className="flex">
            <Users size={24} className="text-brand-turquoise mr-1" />
            <a 
              href={item.link}
              className="text-gray-700 hover:text-brand-turquoise transition-colors"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationMenu;