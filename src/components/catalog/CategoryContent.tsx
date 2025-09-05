import React from 'react';

interface CategoryContentProps {
  content: {
    title: string;
    categories: {
      title: string;
      items: string[];
    }[];
    promos: {
      title: string;
      description: string;
      image: string;
    }[];
  };
}

const CategoryContent: React.FC<CategoryContentProps> = ({ content }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">{content.title}</h2>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-3 grid grid-cols-3 gap-8">
          {content.categories.map((category) => (
            <div key={category.title}>
              <h3 className="font-semibold mb-4">{category.title}</h3>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <a key={item} href="#" className="block py-1 hover:text-teal-600">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {content.promos.map((promo) => (
            <div key={promo.title}>
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-auto rounded-lg mb-4"
              />
              <a href="#" className="block text-teal-600 hover:text-teal-700 font-medium">
                {promo.title}
              </a>
              <p className="text-sm text-gray-600">{promo.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryContent;