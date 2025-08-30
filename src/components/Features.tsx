import React from 'react';
import { UserSearch, RefreshCw, Award, Store, Truck, FlaskRound as Flask } from 'lucide-react';
import FeatureItem from './features/FeatureItem';

const features = [
  { icon: UserSearch, title: 'Индивидуальный', description: 'Персональный Подбор Матрас' },
  { icon: Award,      title: 'Гарантия',       description: 'Качества И Долговечности' },
  { icon: Store,      title: 'Шоурум',         description: 'В Центре Города' },
  { icon: Truck,      title: 'Доставка',       description: 'По Всему Таджикистану' },
  { icon: Flask,      title: 'Экологически',   description: 'Чистые И Гипоаллергенные Материалы' },
];

const Features: React.FC = () => {
  return (
    <section aria-label="Преимущества" className="max-w-7xl mx-auto px-4 py-10 sm:py-12 md:py-16">
      <div
        className="
          grid gap-6 sm:gap-8
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-5
        "
      >
        {features.map((feature, i) => (
          <div
            key={i}
            className="
              h-full
              flex items-start sm:items-center lg:items-start
              sm:flex-row lg:flex-col
              gap-3 sm:gap-4
              text-center sm:text-left lg:text-center
              bg-white
            "
          >
            {/* Icon: scale by breakpoint */}
            <div className="
              mx-auto sm:mx-0 lg:mx-auto
              inline-flex items-center justify-center
              w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12
              rounded-full border border-gray-200
            ">
              {/* FeatureItem can render icon, but if it doesn't, render here: */}
              <feature.icon size={20} className="text-brand-turquoise" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-brand-navy">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
