import React from 'react';

interface CategoryItemProps {
  category: {
    id: number;
    name: string;
    image: string;
    slug: string;
    link?: string;
  };
  onCategoryClick: (category: any, e: React.MouseEvent) => void;
  index?: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onCategoryClick, index = 0 }) => {
  const isLikelyAboveFold = index < 4;
  return (
    <a
      href={category.link || `/categories/${category.slug}`}
      onClick={(e) => onCategoryClick(category, e)}
      className="group block text-center"
    >
      <div className="aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center p-2">
        <img
          src={category.image}
          alt={`Категория ${category.name} - товары для сна Sakina`}
          className="w-full h-auto max-w-[120px] object-contain mx-auto"
          loading={isLikelyAboveFold ? 'eager' : 'lazy'}
          decoding="async"
          width="240"
          height="240"
        />
      </div>
      <span className="block text-[16px] font-medium leading-tight text-center text-gray-900 group-hover:text-brand-turquoise">
        {category.name}
      </span>
    </a>
  );
};

export default CategoryItem;