// src/components/AskonaClub.tsx
import React, { useState } from 'react';
import RegistrationModal from './RegistrationModal';
import ClubBenefits from './club/ClubBenefits';

const AskonaClub = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-gray-50 rounded-2xl">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-2/5 h-80">
            <img
              src="https://ik.imagekit.io/3js0rb3pk/Sakina/%D0%B8%D0%BA%D0%BE%D0%BD%D0%BA%D0%B0.png"
              alt="Sakina Club"
              className="club-image"
            />
          </div>
          
          {/* Content Section */}
          <div className="p-6 md:p-8 md:w-3/5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Вступайте в Клуб Sakina!</h2>
            <div className="inline-block bg-[#E8F5E9] px-3 py-1 rounded-full text-sm text-gray-700 mb-4">
              Получайте еще больше бонусов и преимуществ
            </div>
            
            <ClubBenefits />

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto bg-brand-turquoise text-white px-6 py-2 rounded-lg hover:bg-brand-navy transition-colors"
            >
              Войти или зарегистрироваться
            </button>
          </div>
        </div>
      </div>

      <RegistrationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AskonaClub;