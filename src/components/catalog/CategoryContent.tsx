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
  onItemClick?: (sectionTitle: string, item: string) => void;
  onSeeAll?: () => void;
}

const CategoryContent: React.FC<CategoryContentProps> = ({ content, onItemClick, onSeeAll }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{content.title}</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            Посмотреть все →
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-3 grid grid-cols-3 gap-8">
          {content.categories.map((category) => (
            <div key={category.title}>
              <h3 className="font-semibold mb-4 text-gray-900">{category.title}</h3>
              <div className="space-y-2">
                {category.items.length === 0 ? (
                  <p className="text-sm text-gray-400">Нет данных</p>
                ) : (
                  category.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => onItemClick?.(category.title, item)}
                      className="block w-full text-left py-1 text-gray-700 hover:text-teal-600 transition-colors"
                    >
                      {item}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {content.promos.map((promo) => (
            <div key={promo.title} className="bg-gray-50 rounded-lg p-4">
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-auto rounded-lg mb-4"
              />
              <button
                onClick={onSeeAll}
                className="block w-full text-left text-teal-600 hover:text-teal-700 font-medium mb-1"
              >
                {promo.title}
              </button>
              <p className="text-sm text-gray-600">{promo.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryContent;