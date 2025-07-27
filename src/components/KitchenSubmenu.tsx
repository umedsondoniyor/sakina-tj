import React from 'react';
import { ChefHat, Table2, Coffee, Map as Tap, UtensilsCrossed, Shirt, Palmtree, Lamp } from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  title: string;
  image: string;
}

const menuItems: MenuItem[] = [
  {
    icon: ChefHat,
    title: 'Кухонные гарнитуры',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Table2,
    title: 'Мебель для кухни',
    image: 'https://images.unsplash.com/photo-1595514535415-dae8580c416c?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Coffee,
    title: 'Бытовая техника',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Tap,
    title: 'Сантехника',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: UtensilsCrossed,
    title: 'Посуда',
    image: 'https://images.unsplash.com/photo-1563217894-c4c35987c571?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Shirt,
    title: 'Текстиль',
    image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Palmtree,
    title: 'Декор',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Lamp,
    title: 'Освещение',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Table2,
    title: 'Готовые интерьеры',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=150&q=80'
  }
];

interface KitchenSubmenuProps {
  onClose: () => void;
}

const KitchenSubmenu: React.FC<KitchenSubmenuProps> = ({ onClose }) => {
  return (
    <div className="fixed left-0 right-0 bg-white shadow-lg z-50 border-t" style={{ top: '144px' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">Кухня</h2>
        <div className="grid grid-cols-8 gap-6">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="flex flex-col items-center group"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              <div className="w-20 h-20 mb-2 rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <span className="text-sm text-center group-hover:text-teal-600">
                {item.title}
              </span>
            </a>
          ))}
        </div>

        {/* Kitchen Design Section */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Дизайн-проект кухни</h3>
            <p className="text-gray-600 text-sm mb-4">создайте идеальное пространство для готовки</p>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              Заказать проект
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Подбор мебели для кухни</h3>
            <p className="text-gray-600 text-sm mb-4">широкий выбор столов, стульев и гарнитуров</p>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              Подобрать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenSubmenu;