import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    label: 'Для кого вы подбираете матрас?',
    key: 'userType',
    options: [
      { value: 'self', label: 'Для себя', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/dlya_sebya.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'couple', label: 'Для двоих', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/dlya_dvoix.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'child', label: 'Для ребенка', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/dlya_rebyonka.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'elderly', label: 'Для пожилых', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/dlya_roditeley.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
    ],
  },
  {
    label: 'Выберите пол ребенка',
    key: 'kid_gender',
    options: [
      { value: 'boy', label: 'Мальчик', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/malchik.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'girl', label: 'Девочка', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/devochka.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
    ],
  },
  {
    label: 'Выберите возраст мальчика',
    key: 'boy_age',
    options: [
      { value: 'from0to3', label: 'от 0 до 3 лет', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/vozrast-mal/0-3.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'from3to7', label: 'от 3 до 7 лет', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/vozrast-mal/3-7.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'from7to14', label: 'от 7 до 14 лет', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/vozrast-mal/7-14.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
    ],
  },
  {
    label: 'Выберите возраст девочки',
    key: 'girl_age',
    options: [
      { value: 'from0to3', label: 'от 0 до 3 лет', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/vozrast-dev/0-3.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'from3to7', label: 'от 3 до 7 лет', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/vozrast-dev/3-7.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'from7to14', label: 'от 7 до 14 лет', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/rebyonok/vozrast-dev/7-14.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
    ],
  },
  {
    label: 'Как вы обычно засыпаете?',
    key: 'sleep_pose',
    options: [
      { value: 'back', label: 'На спине', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/sleep_pose/back.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'side', label: 'На боку', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/sleep_pose/side.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'tommy', label: 'На животе', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/sleep_pose/tommy.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
      { value: 'differentiates', label: 'По-разному', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/sleep_pose/changes.webp?format=webp&func=auto&fit=cover&width=480&height=303&dpr=1' },
    ],
  },
  {
    label: 'Что мешает вам выспаться?',
    key: 'what_bothers',
    options: [
      { value: 'back', label: 'Боль в спине', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/chto%20meshayet/bol_v_spine.webp' },
      { value: 'hot', label: 'Жарко', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/chto%20meshayet/jarko.webp?updatedAt=1748847687657' },
      { value: 'week_support', label: 'Слабая поддержка', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/chto%20meshayet/slabaya_poderjka.webp' },
      { value: 'do_not_sleep_on_mattress', label: 'Сплю не на матрасе', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/chto%20meshayet/splyu_ne_na_matrase.webp' },
      { value: 'all_good', label: 'Ничего не мешает', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/chto%20meshayet/nichego_ne_meshayet.webp' },
    ],
  },
  {
    label: 'Выберите размер матраса для двоих',
    key: 'self_size',
    options: [
      { value: '90_200', label: '90×200', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/razmeri/90x200.webp' },
      { value: '120_200', label: '120×200', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/razmeri/120x200.webp' },
      { value: '140_200', label: '140×200', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/razmeri/140x200.webp' },
      { value: '160_200', label: '160×200', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/razmeri/160x200.webp' },
      { value: '180_200', label: '180×200', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/razmeri/180x200.webp' },
      { value: '200_200', label: '200×200', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/razmeri/200x200.webp' },
    ],
  },
  {
    label: 'Какую жесткость матраса вы предпочитаете?',
    key: 'hardness',
    options: [
      { value: 'soft', label: 'Мягкий', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/jyostkost%20matrasa/myagkiy.webp' },
      { value: 'middle', label: 'Средний', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/jyostkost%20matrasa/sredniy.webp' },
      { value: 'hard', label: 'Жесткий', img: 'https://ik.imagekit.io/3js0rb3pk/picker_deatils/jyostkost%20matrasa/jyostkiy.webp' },
    ],
  },
  {
    label: 'Выберите ценовой диапазон будущего матраса',
    key: 'price_option',
    options: [
      { value: '20_50', label: '20 000 — 50 000 Somoni', img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=300&q=80' },
      { value: '50_more', label: 'свыше 50 000 Somoni', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80' }
    ],
  },
];

const QuizModal: React.FC<QuizModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  if (!open) return null;

  // Get the appropriate step based on user type and current progress
  const getCurrentStep = () => {
    // If user selected child path
    if (selections.userType === 'child') {
      switch (activeStep) {
        case 0: return steps[0]; // userType
        case 1: return steps[1]; // kid_gender
        case 2: return selections.kid_gender === 'boy' ? steps[2] : steps[3]; // age based on gender
        default: return undefined;
      }
    }
    
    // For non-child paths (self, couple, elderly)
    if (selections.userType && activeStep > 0) {
      // Skip child-specific steps (kid_gender, boy_age, girl_age)
      // and continue with adult questions
      const adultSteps = [
        steps[0], // userType
        steps[4], // sleep_pose
        steps[5], // what_bothers
        steps[6], // self_size
        steps[7], // hardness
        steps[8], // price_option
      ];
      return activeStep < adultSteps.length ? adultSteps[activeStep] : undefined;
    }

    // First step or no selection yet
    return steps[0];
  };

  const handleSelect = (option: string) => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    const newSelections = {
      ...selections,
      [currentStep.key]: option,
    };
    setSelections(newSelections);

    // If child flow and we've selected age, go to products
    if (newSelections.userType === 'child' && 
       (currentStep.key === 'boy_age' || currentStep.key === 'girl_age')) {
      handleSubmit(newSelections);
      return;
    }

    handleNext();
  };

  const handleNext = () => {
    const nextStep = activeStep + 1;
    const currentStep = getCurrentStep();
    
    // If no current step or next step would be undefined, submit
    if (!currentStep || !getCurrentStep()) {
      handleSubmit();
      return;
    }

    setActiveStep(nextStep);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (finalSelections = selections) => {
    const filters = {
      hardness: finalSelections.hardness ? [finalSelections.hardness] : [],
      width: finalSelections.self_size ? [parseInt(finalSelections.self_size.split('_')[0])] : [],
      length: finalSelections.self_size ? [parseInt(finalSelections.self_size.split('_')[1])] : [],
      price: finalSelections.price_option === '20_50' ? [20000, 50000] : finalSelections.price_option === '50_more' ? [50000] : [],
      inStock: true
    };

    navigate('/products', { 
      state: { 
        filters,
        selections: finalSelections
      } 
    });
    onClose();
  };

  const currentStep = getCurrentStep();
  const totalSteps = selections.userType === 'child' ? 3 : 6; // 6 steps for adult flow
  const progress = ((activeStep + 1) / totalSteps) * 100;

  // Return early if no current step is found
  if (!currentStep) {
    handleSubmit();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 z-10"
          >
            <X size={24} />
          </button>

          <div className="h-2 bg-gray-200 rounded-full mb-6">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-xl font-semibold text-center mb-6">
            {currentStep.label}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {currentStep.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`relative rounded-lg overflow-hidden transition-all ${
                  selections[currentStep.key] === option.value
                    ? 'ring-2 ring-teal-500'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={option.img}
                    alt={option.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-center font-medium">
                    {option.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;