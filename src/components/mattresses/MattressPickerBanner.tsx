import React from 'react';

interface MattressPickerBannerProps {
  onOpenQuiz: () => void;
}

const MattressPickerBanner: React.FC<MattressPickerBannerProps> = ({ onOpenQuiz }) => {
  return (
    <div 
      className="flex bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-3 mb-8 text-white relative items-center justify-center cursor-pointer hover:from-teal-600 hover:to-teal-700 transition-all duration-300"
      onClick={onOpenQuiz}
    >
      <img 
        src="https://www.askona.ru/uploads/matrasy_spread/button/mattress.png" 
        alt="матрас" 
        className="absolute left-2 md:left-4 w-24 h-24 md:w-32 md:h-32 object-contain -top-6 md:-top-12"
      />
      <div className="relative z-10 text-center px-4 md:px-0">
        <strong className="text-lg md:text-xl font-bold mb-2">Подборщик матрасов</strong>
        <span className="hidden md:inline text-md md:text-xl semi-bold mb-2">: создайте идеальное место для сна</span>
      </div>
      <div className="hidden md:block absolute right-16 top-4 w-12 h-12 bg-yellow-400 rounded-full transform translate-x-8 -translate-y-8"></div>
      <div className="hidden md:block absolute right-16 bottom-6 w-20 h-20 bg-yellow-300 rounded-full transform translate-y-8"></div>
    </div>
  );
};

export default MattressPickerBanner;