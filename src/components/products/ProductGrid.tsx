import React from 'react';
import { Star } from 'lucide-react';
import type { Product } from '../../lib/types';

interface ProductGridProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          Товары не найдены
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group cursor-pointer"
          onClick={() => onProductClick(product.id)}
        >
          <div className="relative mb-4">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            {product.sale_percentage && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
                -{product.sale_percentage}%
              </span>
            )}
          </div>
          <div>
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
              <span className="text-sm text-gray-500 ml-2">{product.review_count}</span>
            </div>
            <h3 className="font-medium mb-2 group-hover:text-teal-600 line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">{product.price.toLocaleString()} c.</span>
              {product.old_price && (
                <span className="text-sm text-gray-500 line-through">
                  {product.old_price.toLocaleString()} c.
                </span>
              )}
            </div>
            <button className="w-full mt-4 bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition-colors">
              В корзину
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;