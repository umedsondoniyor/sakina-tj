import React from 'react';
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

const regularMenuItems = ['О нас'];

const NavigationMenu = () => {
  return (
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
  );
};

export default NavigationMenu;