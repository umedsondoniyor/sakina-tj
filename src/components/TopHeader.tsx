import React from 'react';
import { ChevronDown } from 'lucide-react';

const TopHeader = () => {
  return (
    <div className="hidden md:block bg-gray-100 py-2 px-4 text-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-teal-600">Душанбе</a>
          <a href="#" className="hover:text-teal-600">Салоны</a>
          <a href="#" className="hover:text-teal-600">Акции</a>
          <a href="#" className="hover:text-teal-600">Услуги</a>
        </div>
        <div className="flex items-center space-x-6">
          <div className="group relative">
            <button className="flex items-center hover:text-teal-600">
              Покупателям
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          <div className="group relative">
            <button className="flex items-center hover:text-teal-600">
              Доставка и оплата
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          <a href="#" className="hover:text-teal-600">Статус заказа</a>
          <a href="tel:+992905339595" className="font-medium hover:text-teal-600">+992 90 533 9595</a>
        </div>
      </div>
    </div>
  );
}

export default TopHeader;