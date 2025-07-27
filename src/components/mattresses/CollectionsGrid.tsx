import React from 'react';

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
}

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

const CollectionsGrid = () => {
  return (
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
  );
};

export default CollectionsGrid;