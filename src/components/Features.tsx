import React from 'react';
import { UserSearch, Award, Store, Truck, FlaskRound as Flask } from 'lucide-react';

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
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="
                h-full
                flex flex-col items-center text-center
                sm:flex-row sm:items-center sm:text-left
                lg:flex-col lg:items-center lg:text-center
                gap-3 sm:gap-4
              "
            >
              {/* Icon */}
              <div
                className="
                  inline-flex items-center justify-center
                  w-12 h-12 sm:w-12 sm:h-12 lg:w-14 lg:h-14
                  rounded-full border border-gray-200
                  shrink-0
                "
              >
                <Icon size={22} className="text-brand-turquoise" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="font-semibold text-base lg:text-lg text-brand-navy">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {f.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
