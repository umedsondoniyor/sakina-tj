import { useState } from 'react';
import QuizModal from './QuizModal';

const ProductPickers = () => {
  const [isMattressQuizOpen, setIsMattressQuizOpen] = useState(false);
  const [isBedQuizOpen, setIsBedQuizOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
        {/* Mattress Picker */}
        <div 
          className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsMattressQuizOpen(true)}
        >
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик матрасов</h3>
            <p className="mb-4">
              создайте идеальное место для сна
            </p>
            <button className="inline-block bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800 transition-colors">
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
        <div 
          className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsBedQuizOpen(true)}
        >
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик кроватей</h3>
            <p className="mb-4">
              более 100 моделей для детей и взрослых
            </p>
            <button className="inline-block bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800 transition-colors">
              Подобрать
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="https://ik.imagekit.io/3js0rb3pk/bed.png"
              alt="Bed"
              className="w-auto h-48 md:h-64 object-contain "
            />
          </div>
        </div>
{/* vremenno etto uberayem tak kak Abdumanob tak poprosil */}
        {/* Pillow Picker */}
        {/* <div 
          className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsQuizOpen(true)}
        >
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик подушек</h3>
            <p className="mb-4">
              спальное место начинается с подушки
            </p>
            <button className="inline-block bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800 transition-colors">
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
        </div> */}

        {/* Massage Chair */}
        {/* <div 
          className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsQuizOpen(true)}
        >
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подбор массажного кресло</h3>
            <p className="mb-4">
              поможем создать уют в вашем доме
            </p>
            <button className="inline-block bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800 transition-colors">
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
        </div> */}

        {/* Quiz Modals */}
        <QuizModal open={isMattressQuizOpen} onClose={() => setIsMattressQuizOpen(false)} productType="mattress" />
        <QuizModal open={isBedQuizOpen} onClose={() => setIsBedQuizOpen(false)} productType="bed" />
      </div>
    </div>
  );
};

export default ProductPickers;