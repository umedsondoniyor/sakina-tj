// src/components/BedroomSubmenu.tsx
import React from 'react';
import { Bed, Box, Shirt, Lamp } from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  title: string;
  image: string;
}

const menuItems: MenuItem[] = [
  {
    icon: Bed,
    title: 'Кровати',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Box,
    title: 'Матрасы',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Box,
    title: 'Постельные принадлежности',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Shirt,
    title: 'Текстиль и одежда',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Box,
    title: 'Мебель',
    image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Bed,
    title: 'Готовые спальни',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Bed,
    title: 'Трансформируемые основания',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Box,
    title: 'Хранение',
    image: 'https://images.unsplash.com/photo-1616486701797-122562483e11?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Box,
    title: 'Зеркала',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Lamp,
    title: 'Атмосфера дома',
    image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Box,
    title: 'Декор',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Lamp,
    title: 'Освещение',
    image: 'https://images.unsplash.com/photo-1616486701797-122562483e11?auto=format&fit=crop&w=150&q=80'
  },
  {
    icon: Box,
    title: 'Готовые интерьеры',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80'
  }
];

interface BedroomSubmenuProps {
  onClose: () => void;
}

const BedroomSubmenu: React.FC<BedroomSubmenuProps> = ({ onClose }) => {
  return (
    <div className="fixed left-0 right-0 bg-white shadow-lg z-50 border-t" style={{ top: '144px' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">Спальня</h2>
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

        {/* Product Pickers Section */}
        <div className="grid grid-cols-4 gap-8 mt-12">
          <div className="col-span-2 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Подборщик матрасов</h3>
            <p className="text-gray-600 text-sm mb-4">создайте идеальное место для сна</p>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              Подобрать
            </button>
          </div>
          
          <div className="col-span-2 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Подборщик кроватей</h3>
            <p className="text-gray-600 text-sm mb-4">более 100 моделей для детей и взрослых</p>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              Подобрать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedroomSubmenu;