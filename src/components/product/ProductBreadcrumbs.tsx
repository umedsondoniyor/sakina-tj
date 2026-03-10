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
  mattresses: { label: 'Матрасы', href: '/categories/mattresses' },
  pillows:    { label: 'Подушки', href: '/categories/pillows' },
  beds:       { label: 'Кровати', href: '/categories/beds' },
  smartchair: { label: 'Массажные кресла', href: '/categories/smartchair' },
  map:        { label: 'Деревянные 3D-карты', href: '/categories/map' },
};

const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({ productName, category }) => {
  const fallback = { label: 'Каталог', href: '/products' };
  const cat = CATEGORY_MAP[category] ?? fallback;

  return (
    <nav aria-label="Хлебные крошки" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        <li>
          <Link to="/" className="hover:text-teal-600">
            Главная
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to="/products" className="hover:text-teal-600">
            Каталог
          </Link>
        </li>
        <li aria-hidden="true">/</li>
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
