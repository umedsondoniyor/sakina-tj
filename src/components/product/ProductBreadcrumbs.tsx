import React from 'react';
import { Link } from 'react-router-dom';

interface ProductBreadcrumbsProps {
  productName: string;
  category: string; // e.g. 'mattresses', 'pillows', 'beds', 'smartchair', 'map'
}

const CATEGORY_MAP: Record<
  string,
  { label: string; href: string }
> = {
  mattresses: { label: 'Матрасы', href: '/mattresses' },
  pillows:    { label: 'Подушки', href: '/products?category=pillows' },
  beds:       { label: 'Кровати', href: '/products?category=beds' },
  smartchair: { label: 'Массажные кресла', href: '/products?category=smartchair' },
  map:        { label: 'Деревянные 3D-карты', href: '/products?category=map' },
};

const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({ productName, category }) => {
  const fallback = { label: 'Каталог', href: '/products' };
  const cat = CATEGORY_MAP[category] ?? fallback;

  return (
    <nav aria-label="Хлебные крошки" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        <li>
          <Link to={cat.href} className="hover:text-teal-600">
            {cat.label}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-gray-900 truncate max-w-[70vw]" title={productName}>
          {productName}
        </li>
      </ol>
    </nav>
  );
};

export default ProductBreadcrumbs;
