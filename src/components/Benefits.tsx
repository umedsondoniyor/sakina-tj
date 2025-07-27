import React, { useState } from 'react';

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
          <div
            key={benefit.id}
            className="relative"
            onMouseEnter={() => setHoveredId(benefit.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex flex-row items-center bg-white rounded-lg transition-all hover:cursor-pointer duration-300 hover:text-brand-turquoise">
              <img
                src={benefit.icon}
                alt={benefit.title}
                className="w-32 h-32 flex-shrink-0 p-4"
              />
              <h3 className="text-lg font-medium">
                <span className="block">{benefit.title}</span>
                <span className="block">{benefit.subtitle}</span>
              </h3>
            </div>
            
            {/* Hover Information - Message Bubble */}
            <div
              className={`absolute left-0 right-0 top-full mt-2 transition-all duration-300 z-10 ${
                hoveredId === benefit.id
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible translate-y-1'
              }`}
            >
              {/* Triangle Pointer */}
              <div 
                className="absolute -top-2 left-8 w-4 h-4 bg-yellow-100 transform rotate-45"
                style={{ clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }}
              />
              
              {/* Message Content */}
              <div className="bg-yellow-100 rounded-lg p-4 relative">
                <p className="text-sm text-gray-800">
                  {benefit.description}
                </p>
                {benefit.id === 1 || benefit.id === 3 ? (
                  <a
                    href="#"
                    className="inline-block mt-2 text-sm text-brand-turquoise hover:text-brand-navy underline"
                  >
                    Подробнее
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Benefits;