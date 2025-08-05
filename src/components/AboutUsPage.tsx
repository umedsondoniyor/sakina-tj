import React from 'react';
import { Award, Users, Heart, Target, Clock, Globe } from 'lucide-react';

const AboutUsPage = () => {
  const stats = [
    { number: '30+', label: 'лет на рынке', icon: Clock },
    { number: '50,000+', label: 'довольных клиентов', icon: Users },
    { number: '100+', label: 'моделей продукции', icon: Award },
    { number: '5', label: 'стран присутствия', icon: Globe }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Забота о здоровье',
      description: 'Мы создаем продукцию, которая способствует здоровому сну и улучшению качества жизни наших клиентов.'
    },
    {
      icon: Award,
      title: 'Качество превыше всего',
      description: 'Используем только проверенные материалы и современные технологии производства.'
    },
    {
      icon: Users,
      title: 'Индивидуальный подход',
      description: 'Каждый клиент уникален, поэтому мы предлагаем персональные решения для комфортного сна.'
    },
    {
      icon: Target,
      title: 'Постоянное развитие',
      description: 'Мы постоянно совершенствуем наши продукты и услуги, следуя последним тенденциям в индустрии сна.'
    }
  ];

  const timeline = [
    {
      year: '1990',
      title: 'Основание компании',
      description: 'Начало пути в индустрии здорового сна'
    },
    {
      year: '2000',
      title: 'Первая лаборатория',
      description: 'Открытие собственной лаборатории контроля качества'
    },
    {
      year: '2010',
      title: 'Международное признание',
      description: 'Получение международных сертификатов качества'
    },
    {
      year: '2020',
      title: 'Цифровая трансформация',
      description: 'Запуск онлайн-платформы и цифровых сервисов'
    },
    {
      year: '2025',
      title: 'Новые горизонты',
      description: 'Расширение ассортимента и география присутствия'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-brand-turquoise to-brand-navy text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">О компании Sakina</h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Мы создаем мир здорового сна уже более 30 лет, помогая людям просыпаться отдохнувшими и полными энергии.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                    <div className="text-2xl font-bold">{stat.number}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80"
                alt="Sakina производство"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-yellow-300 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{stats[2].number}</div>
                <div className="text-sm text-gray-700">{stats[2].label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">Наша миссия</h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Мы верим, что качественный сон — это основа здоровой и счастливой жизни. 
              Наша цель — предоставить каждому человеку возможность наслаждаться комфортным 
              и восстанавливающим сном каждую ночь.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-brand-turquoise rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-navy transition-colors">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-navy">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">История развития</h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Путь от небольшой мастерской до ведущего производителя товаров для сна
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-brand-turquoise hidden md:block"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <div className="text-2xl font-bold text-brand-turquoise mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold text-brand-navy mb-3">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="hidden md:flex w-2/12 justify-center">
                    <div className="w-4 h-4 bg-brand-turquoise rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="hidden md:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">Наша команда</h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Профессионалы, которые делают ваш сон лучше каждый день
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Алексей Иванов',
                position: 'Генеральный директор',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
                description: 'Более 15 лет опыта в индустрии товаров для сна'
              },
              {
                name: 'Мария Петрова',
                position: 'Главный технолог',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=300&q=80',
                description: 'Эксперт по инновационным материалам и технологиям'
              },
              {
                name: 'Дмитрий Сидоров',
                position: 'Руководитель производства',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                description: 'Контроль качества на каждом этапе производства'
              }
            ].map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 rounded-full bg-brand-turquoise opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-semibold text-brand-navy mb-2">{member.name}</h3>
                <p className="text-brand-turquoise font-medium mb-3">{member.position}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-brand-turquoise py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готовы улучшить качество вашего сна?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Свяжитесь с нами для персональной консультации и подбора идеального матраса
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+992905339595"
              className="bg-white text-brand-turquoise px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Позвонить: +992 90 533 9595
            </a>
            <a
              href="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-turquoise transition-colors"
            >
              Посмотреть каталог
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;