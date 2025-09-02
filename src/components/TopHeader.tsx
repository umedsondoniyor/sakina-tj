import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

const TopHeader: React.FC = () => {
  const address = 'Душанбе, Пулоди 4';
  const shopLink = 'https://maps.app.goo.gl/5exgpkraKy9foeD27';

  return (
    <div className="hidden md:block bg-gray-100 py-2 px-4 text-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4 relative">
          {/* Direct link to shop */}
          <a
            href={shopLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-teal-600"
          >
            <MapPin size={16} className="mr-1" />
            {address}
          </a>

          <a href="#" className="hover:text-teal-600">Услуги</a>
        </div>

        <div className="flex items-center space-x-6">
          <div className="group relative">
            <button className="flex items-center hover:text-teal-600">
              Доставка и оплата
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          <a href="tel:+992905339595" className="font-medium hover:text-teal-600">
            +992 90 533 9595
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
