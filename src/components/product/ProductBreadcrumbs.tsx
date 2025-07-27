import React from 'react';

interface ProductBreadcrumbsProps {
  productName: string;
}

const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({ productName }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <a href="/" className="hover:text-teal-600">Матрасы</a>
      <span>/</span>
      <span className="text-gray-900">{productName}</span>
    </div>
  );
};

export default ProductBreadcrumbs;