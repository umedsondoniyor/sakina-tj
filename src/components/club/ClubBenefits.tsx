import React from 'react';
import { MessageCircleHeart, Percent, Cake } from 'lucide-react';

const ClubBenefits = () => {
  return (
    <div className="grid grid-cols-3 gap-8 mb-4">
      <div>
        <MessageCircleHeart className="w-16 h-16 text-brand-turquoise justify-self-center" />
        <p className="text-sm text-gray-600 mt-2">Получайте еженедельные советы по здоровому и комфортному сну.</p>
      </div>
      <div>
        <Percent className="w-16 h-16 text-brand-turquoise justify-self-center" />
        <p className="text-sm text-gray-600 mt-2">Узнайте первыми об акции и скидках.</p>
      </div>
      <div>
        <Cake className="w-16 h-16 text-brand-turquoise justify-self-center" />
        <p className="text-sm text-gray-600 mt-2">Бонусы в день рождения.</p>
      </div>
    </div>
  );
};

export default ClubBenefits;