import React from 'react';

interface MattressType {
  id: string;
  name: string;
  image: string;
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

const MattressTypeGrid = () => {
  return (
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
  );
};

export default MattressTypeGrid;