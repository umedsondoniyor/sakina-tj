import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import QuizModal from './QuizModal';
import Benefits from './Benefits';

interface MattressType {
  id: string;
  name: string;
  image: string;
}

interface HardnessLevel {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface PopularFilter {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  image: string;
  isMain?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  isNew?: boolean;
}

const mattressTypes: MattressType[] = [
  {
    id: 'double',
    name: 'Двуспальные',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/dvuhspal_v2.png'
  },
  {
    id: 'single',
    name: 'Односпальные',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/odnospal_v2.png'
  },
  {
    id: 'children',
    name: 'Детские',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/detskie_v2.png'
  },
  {
    id: 'rolled',
    name: 'Топер для матраса',
    image: 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/namatrasy_v2.png'
  }
];

const hardnessLevels: HardnessLevel[] = [
  {
    id: 'soft',
    name: 'МЯГКИЕ',
    description: 'Для тех, кто предпочитает комфорт',
    level: 2
  },
  {
    id: 'medium',
    name: 'СРЕДНЕЙ ЖЕСТКОСТИ',
    description: 'Универсальный выбор',
    level: 3
  },
  {
    id: 'firm',
    name: 'ЖЕСТКИЕ',
    description: 'Для поддержки позвоночника',
    level: 4
  }
];

const popularFilters: PopularFilter[] = [
  {
    id: 'orthopedic',
    name: 'Ортопедические',
    description: 'Для здоровья позвоночника',
    image: 'https://i.askona.ru/upload/iblock/c47/c479e7185286f1c8da079aefe6261bd9.svg'
  },
  {
    id: 'independent-springs',
    name: 'Независимый пружинный блок',
    description: 'Индивидуальная поддержка',
    image: 'https://i.askona.ru/upload/iblock/784/78420d3ebf9d96a1f11555650042288d.svg'
  },
  {
    id: 'children',
    name: 'Для малышей',
    description: 'Безопасные материалы',
    image: 'https://i.askona.ru/upload/iblock/784/78420d3ebf9d96a1f11555650042288d.svg'
  }
];

const collections: Collection[] = [
  {
    id: 'budget',
    title: 'Бюджетные матрасы',
    description: 'Доступные матрасы с превосходным качеством для комфортного сна',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'premium',
    title: 'Матрасы Премиум',
    description: 'Элитные матрасы с IT-технологиями и дорогими премиальными материалами',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'relaxation',
    title: 'Серия релаксации',
    description: 'Специальные матрасы для максимального расслабления и восстановления',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'business',
    title: 'Бизнес коллекция',
    description: 'Матрасы с идеальным соотношением цены и качества',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'sleep',
    title: 'Серия матрасов',
    description: 'Инновационные матрасы для здорового сна',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'healthy-sleep',
    title: 'Для здорового сна',
    description: 'Ортопедические матрасы для профилактики и лечения проблем со спиной',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80'
  }
];

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

const products: Product[] = [
  {
    id: '1',
    name: 'Comfort Line',
    price: 8459,
    oldPrice: 9399,
    discount: 10,
    rating: 4.8,
    reviews: 127,
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=300&q=80',
    isNew: true
  },
  {
    id: '2',
    name: 'Balance Lux',
    price: 28599,
    oldPrice: 31799,
    discount: 10,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    name: 'Basic Easy Dual Side',
    price: 17297,
    oldPrice: 19219,
    discount: 10,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '4',
    name: 'Premium',
    price: 11999,
    oldPrice: 13332,
    discount: 10,
    rating: 4.8,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80'
  }
];

const Mattresses = () => {
  const [currentHardnessIndex, setCurrentHardnessIndex] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const nextHardness = () => {
    setCurrentHardnessIndex((prev) => (prev + 1) % hardnessLevels.length);
  };

  const prevHardness = () => {
    setCurrentHardnessIndex((prev) => (prev - 1 + hardnessLevels.length) % hardnessLevels.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Матрасы</h1>
        <p className="text-gray-600 mb-8">Подберите идеальный матрас для здорового сна</p>

        {/* Mattress Picker Banner */}
        <div 
          className="flex bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-3 mb-8 text-white relative items-center justify-center cursor-pointer hover:from-teal-600 hover:to-teal-700 transition-all duration-300"
          onClick={() => setIsQuizOpen(true)}
        >
          <img 
            src="https://www.askona.ru/uploads/matrasy_spread/button/mattress.png" 
            alt="матрас" 
            className="absolute left-2 md:left-4 w-24 h-24 md:w-32 md:h-32 object-contain -top-6 md:-top-12"
            />
          <div className="relative z-10 text-center px-4 md:px-0">
            <strong className="text-lg md:text-xl font-bold mb-2">Подборщик матрасов</strong>
            <span className="hidden md:inline text-md md:text-xl semi-bold mb-2">: создайте идеальное место для сна</span>
          </div>
          <div className="hidden md:block absolute right-16 top-4 w-12 h-12 bg-yellow-400 rounded-full transform translate-x-8 -translate-y-8"></div>
          <div className="hidden md:block absolute right-16 bottom-6 w-20 h-20 bg-yellow-300 rounded-full transform translate-y-8"></div>
        </div>

        {/* By Type Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">По типу</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mattressTypes.map((type) => (
              <div key={type.id} className="text-center group cursor-pointer">
                <div className="mx-auto mb-3 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={type.image}
                    alt={type.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-sm font-medium group-hover:text-teal-600 transition-colors">
                  {type.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* By Hardness Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Популярные фильтры</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hardnessLevels.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-colors"
              >
                <div>
                  <h3 className="font-medium">{filter.name}</h3>
                  <p className="text-sm text-gray-600">{filter.description}</p>
                  {/* Hardness level circles */}
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, index) => (
                      <div 
                        key={index}
                        className={`w-2 h-2 rounded-full border ${
                          index < filter.level 
                            ? 'bg-teal-500 border-teal-500' 
                            : 'border-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <ChevronRight size={20} className="ml-auto text-gray-400" />
              </div>
            ))}
          </div>
        </section>

        {/* Popular Filters Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Популярные фильтры</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-colors"
              >
                {/* <div className="text-2xl mr-4">{filter.icon}</div> */}
                  <img
                    className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                    src={filter.image}
                    alt={filter.name}
                  />
                <div>
                  <h3 className="font-medium">{filter.name}</h3>
                  <p className="text-sm text-gray-600">{filter.description}</p>
                </div>
                <ChevronRight size={20} className="ml-auto text-gray-400" />
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <Benefits/>

        {/* Collections Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">По коллекции</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="group cursor-pointer">
                <div className="relative rounded-lg overflow-hidden mb-4">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <h3 className="font-bold mb-2 group-hover:text-teal-600 transition-colors">
                  {collection.title}
                </h3>
                <p className="text-sm text-gray-600">{collection.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition-colors">
              Смотреть все матрасы
            </button>
          </div>
        </section>

        {/* First Purchase Section */}
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

        {/* Hit Sales Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Хиты продаж</h2>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {product.discount && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      -{product.discount}%
                    </span>
                  )}
                  {product.isNew && (
                    <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">{product.reviews}</span>
                </div>
                <h3 className="font-medium mb-2 group-hover:text-teal-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg font-bold">{product.price.toLocaleString()} ₽</span>
                  {product.oldPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.oldPrice.toLocaleString()} ₽
                    </span>
                  )}
                </div>
                <button className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors">
                  Подробнее
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quiz Modal */}
      <QuizModal open={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
};

export default Mattresses;