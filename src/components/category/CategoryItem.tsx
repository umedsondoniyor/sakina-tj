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
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onCategoryClick }) => {
  return (
    <a
      href={category.slug === 'mattresses' ? '/mattresses' : `/products?category=${category.slug}`}
      onClick={(e) => onCategoryClick(category, e)}
      className="group content-center"
    >
      <div className="aspect-square bg-white rounded-lg overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-contain"
        />
      </div>
      <span className="block text-[16px] font-medium leading-tight text-center text-gray-900 group-hover:text-brand-turquoise">
        {category.name}
      </span>
    </a>
  );
};

export default CategoryItem;