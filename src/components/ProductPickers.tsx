import { useState, useEffect } from 'react';
import QuizModal from './QuizModal';
import { getQuizPickerVisibility } from '../lib/api';

const ProductPickers = () => {
  const [isMattressQuizOpen, setIsMattressQuizOpen] = useState(false);
  const [isBedQuizOpen, setIsBedQuizOpen] = useState(false);
  const [visibility, setVisibility] = useState({ mattress: true, bed: true });

  useEffect(() => {
    let cancelled = false;
    getQuizPickerVisibility()
      .then((v) => {
        if (!cancelled) setVisibility(v);
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visibility.mattress && !visibility.bed) {
    return null;
  }

  const bothPickersVisible = visibility.mattress && visibility.bed;

  return (
    <>
    <div className="container mx-auto px-4 py-12">
      <div
        className={
          bothPickersVisible
            ? 'grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-14'
            : 'mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 sm:max-w-4xl'
        }
      >
        {/* Mattress Picker */}
        {visibility.mattress ? (
        <div 
          className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsMattressQuizOpen(true)}
        >
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик матрасов</h3>
            <p className="mb-4">
              создайте идеальное место для сна
            </p>
            <button className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors font-semibold">
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
        ) : null}

        {/* Bed Picker */}
        {visibility.bed ? (
        <div 
          className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsBedQuizOpen(true)}
        >
          <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
            <h3 className="text-2xl font-bold mb-2">Подборщик кроватей</h3>
            <p className="mb-4">
              более 100 моделей для детей и взрослых
            </p>
            <button className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors font-semibold">
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
        ) : null}
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
            <button className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors font-semibold">
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
            <button className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded hover:bg-brand-navy transition-colors font-semibold">
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

      </div>
    </div>
    {visibility.mattress ? (
      <QuizModal open={isMattressQuizOpen} onClose={() => setIsMattressQuizOpen(false)} productType="mattress" />
    ) : null}
    {visibility.bed ? (
      <QuizModal open={isBedQuizOpen} onClose={() => setIsBedQuizOpen(false)} productType="bed" />
    ) : null}
    </>
  );
};

export default ProductPickers;