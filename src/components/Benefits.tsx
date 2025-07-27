import React, { useState } from 'react';
import BenefitCard from './benefits/BenefitCard';

interface Benefit {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    id: 1,
    icon: '/images/review.png',
    title: 'Более 1000+',
    subtitle: 'положительных отзывов',
    description: 'Тысячи счастливых историй — тысячи спокойных ночей. Люди доверяют Sakina свой сон — и остаются влюблены в комфорт.'
  },
  {
    id: 2,
    icon: '/images/waranty.png',
    title: 'Гарантия - 8 лет,',
    subtitle: 'но прослужить более 20 лет',
    description: 'Матрас, который заботится о вас долгие годы. Мы уверены в своём качестве и готовы отвечать за него.'
  },
  {
    id: 3,
    icon: '/images/delivery.png',
    title: 'Быстрая доставка',
    subtitle: 'в день заказа',
    description: 'Комфорт не должен ждать. Вы выбираете — мы доставляем уже сегодня, чтобы этой ночью вы спали лучше.'
  },
  {
    id: 4,
    icon: '/images/labratory.png',
    title: 'Своя лаборатория',
    subtitle: 'для контроля качества',
    description: 'Каждая деталь проверена с любовью и заботой о вашем здоровье. Только то, что достойно вашего сна.'
  }
];

const Benefits = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        {benefits.map((benefit) => (
          <BenefitCard
            key={benefit.id}
            benefit={benefit}
            isHovered={hoveredId === benefit.id}
            onMouseEnter={() => setHoveredId(benefit.id)}
            onMouseLeave={() => setHoveredId(null)}
          />
        ))}
      </div>
    </div>
  );
};

export default Benefits;