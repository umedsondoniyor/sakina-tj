import React from 'react';
import { UserSearch, RefreshCw, Award, Store,Truck, FlaskRound as Flask } from 'lucide-react';

const features = [
  {
    icon: UserSearch,
    title: 'Индивидуальный',
    description: 'Персональный Подбор Матрас'
  },
  {
    icon: Award,
    title: 'Гарантия',
    description: 'Качества И Долговечности'
  },
  {
    icon: Store,
    title: 'Шоурум',
    description: 'В Центре Города'
  },
  {
    icon: Truck,
    title: 'Доставка',
    description: 'По Всему Таджикистану'
  },
  {
    icon: Flask,
    title: 'Экологически ',
    description: 'Чистые И Гипоаллергенные Материалы'
  },
];

const Features = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <feature.icon size={48} className="text-brand-turquoise" />
            </div>
            <div className="text-brand-navy">
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Features;