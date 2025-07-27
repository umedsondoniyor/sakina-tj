import React, { useState } from 'react';
import QuizModal from './QuizModal';

const ProductPickers = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
        {/* Mattress Picker */}
        <div className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик матрасов</h3>
            <p className="mb-4">
              создайте идеальное место для сна
            </p>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors"
            >
              Подобрать
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="/images/picker/mattress_picker.png"
              alt="Mattress"
              className="w-auto h-48 md:h-64 object-contain"
            />
          </div>
        </div>

        {/* Bed Picker */}
        <div className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик кроватей</h3>
            <p className="mb-4">
              более 100 моделей для детей и взрослых
            </p>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors"
            >
              Подобрать
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="https://ik.imagekit.io/3js0rb3pk/bed.png"
              alt="Bed"
              className="w-auto h-48 md:h-64 object-contain"
            />
          </div>
        </div>

        {/* Pillow Picker */}
        <div className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик подушек</h3>
            <p className="mb-4">
              спальное место начинается с подушки
            </p>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors"
            >
              Подобрать
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="https://ik.imagekit.io/3js0rb3pk/pillow.png"
              alt="Pillow"
              className="w-auto h-48 md:h-64 object-contain"
            />
          </div>
        </div>

        {/* Massage Chair */}
        <div className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подбор массажного кресло</h3>
            <p className="mb-4">
              поможем создать уют в вашем доме
            </p>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors"
            >
              Подобрать
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="/images/picker/smart-chair1.png"
              alt="Massage Chair"
              className="w-auto h-48 md:h-64 object-contain"
            />
          </div>
        </div>

        {/* Quiz Modal */}
        <QuizModal open={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      </div>
    </div>
  );
};

export default ProductPickers;