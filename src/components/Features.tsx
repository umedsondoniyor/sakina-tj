import React from 'react';
import { UserSearch, RefreshCw, Award, Store,Truck, FlaskRound as Flask } from 'lucide-react';
import FeatureItem from './features/FeatureItem';

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
          <FeatureItem key={index} feature={feature} />
        ))}
      </div>
    </div>
  );
}

export default Features;