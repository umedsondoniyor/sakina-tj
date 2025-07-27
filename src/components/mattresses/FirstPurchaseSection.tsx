import React from 'react';

interface Article {
  id: string;
  title: string;
  description: string;
  image: string;
  isMain?: boolean;
}

const articles: Article[] = [
  {
    id: 'main',
    title: 'Полный гид по выбору матраса: виды, важные параметры и специальные функции',
    description: 'Выбор матраса может показаться сложным, но с нашим подробным гидом вы найдете идеальный вариант.',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80',
    isMain: true
  },
  {
    id: 'orthopedic',
    title: 'Типы ортопедических матрасов',
    description: 'Разбираемся в особенностях ортопедических матрасов и их влиянии на здоровье.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'buying-guide',
    title: 'Что купить вместе с матрасом: 5 необходимых товаров',
    description: 'Дополнительные товары, которые сделают ваш сон еще комфортнее.',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'children',
    title: 'Как выбрать детский матрас?',
    description: 'Все что нужно знать при выборе матраса для ребенка.',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80'
  }
];

const FirstPurchaseSection = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Первая покупка</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <img
            src={articles[0].image}
            alt={articles[0].title}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="font-bold text-lg mb-2">{articles[0].title}</h3>
            <p className="text-sm opacity-90 mb-4">{articles[0].description}</p>
            <button className="text-teal-300 hover:text-teal-200 transition-colors">
              Читать
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {articles.slice(1).map((article) => (
            <div key={article.id} className="flex space-x-4 group cursor-pointer">
              <img
                src={article.image}
                alt={article.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div>
                <h3 className="font-medium mb-2 group-hover:text-teal-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                <button className="text-teal-600 text-sm hover:text-teal-700 transition-colors">
                  Читать
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FirstPurchaseSection;