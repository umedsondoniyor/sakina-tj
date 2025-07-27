import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  title: string;
  image: string;
}

export interface ActionItem {
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
}

interface CategorySubmenuProps {
  title: string;
  menuItems: MenuItem[];
  actionItems: ActionItem[];
  onClose: () => void;
}

const CategorySubmenu: React.FC<CategorySubmenuProps> = ({
  title,
  menuItems,
  actionItems,
  onClose
}) => {
  return (
    <div className="fixed left-0 right-0 bg-white shadow-lg z-50 border-t" style={{ top: '144px' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
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

        <div className="grid grid-cols-2 gap-8 mt-12">
          {actionItems.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <button
                onClick={item.onClick}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {item.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySubmenu;