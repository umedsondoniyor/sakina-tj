import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FlaskConical, Leaf, Star } from 'lucide-react';

const features = [
  {
    icon: FlaskConical,
    title: 'Индивидуальный подход',
    description:
      'Мы подбираем матрас с учётом ваших потребностей и состояния здоровья.',
  },
  {
    icon: Leaf,
    title: 'Качество и инновации',
    description:
      'Используем только проверенные материалы и современные технологии, включая независимый пружинный блок и технологию “матрас в рулоне”.',
  },
  {
    icon: Star,
    title: 'Забота о клиенте',
    description:
      'Мы сопровождаем вас на каждом этапе – от выбора до доставки и установки.',
  },
];

const AboutUs: React.FC = () => {
  return (
    <>
      {/* ✅ SEO metadata */}
      <Helmet>
        <title>О нас | Sakina.tj — Эксперты в мире качественного сна</title>
        <meta
          name="description"
          content="Компания Sakina — эксперт в мире качественного сна. Мы создаём матрасы и товары для сна, сочетая инновации, индивидуальный подход и заботу о клиентах."
        />
        <meta property="og:title" content="О нас | Sakina.tj" />
        <meta
          property="og:description"
          content="Наша миссия — помочь каждому клиенту найти идеальный матрас для комфортного и здорового сна."
        />
        <meta property="og:image" content="/og-about.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ✅ Page content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xl text-brand-navy md:text-5xl font-bold mb-3 md:mb-6">
          О нас
        </h2>
        <div className="bg-yellow-300 h-2 w-16 mb-3 md:mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12">
          <div className="md:col-span-1">
            <p className="text-gray-600 text-sm md:text-base">
              <span className="text-brand-navy font-bold">Sakina</span> – эксперт
              в мире качественного сна.
              <br />
              <br />
              Мы в <span className="text-brand-navy font-bold">Sakina</span>{' '}
              верим, что хороший сон — основа здоровой и счастливой жизни. Наша
              миссия — помочь каждому клиенту найти идеальный матрас, который
              обеспечит максимальный комфорт и заботу о здоровье. Мы не просто
              продаём матрасы — мы создаём условия для вашего качественного
              отдыха и восстановления.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-yellow-300 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
