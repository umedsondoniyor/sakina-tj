import React from 'react';
import { Star, Heart, Eye, Truck, Box, ArrowLeftRight } from 'lucide-react';
import type { Product } from '../../lib/types';

interface ProductInfoProps {
  product: Product;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  onAddToCart: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedSize,
  onSizeChange,
  onAddToCart
}) => {
  const sizes = [
    { size: '80×200', price: 36139 },
    { size: '90×200', price: 38977 },
    { size: '140×200', price: 49895 },
    { size: '160×200', price: 53880 },
    { size: '180×200', price: 59064 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Анатомический матрас {product.name}
      </h1>
      
      <div className="flex items-center mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < product.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600">
          {product.review_count} отзывов
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl font-bold">
            {product.price.toLocaleString()} ₽
            {product.old_price && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                {product.old_price.toLocaleString()} ₽
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            + 2 694 бонусов
          </div>
        </div>
      </div>

      {/* Size Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Размер (Ш×Д)</h3>
          <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
            Все размеры (14)
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map(({ size, price }) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`p-2 text-center border rounded-lg transition-colors ${
                selectedSize === size
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-500'
              }`}
            >
              <div className="font-medium">{size}</div>
              <div className="text-sm text-gray-600">
                {price.toLocaleString()} ₽
              </div>
              {selectedSize === size && (
                <div className="text-xs text-teal-600">В наличии</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center text-sm">
          <Box className="w-5 h-5 mr-2 text-teal-600" />
          <div>
            <div>Гарантия на товар 1.5 года</div>
            <div>35 лет при покупке с чехлом</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onAddToCart}
          className="flex-1 bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors"
        >
          В корзину
        </button>
        <button className="p-3 border border-gray-200 rounded-lg hover:border-teal-500 transition-colors">
          <Heart className="w-6 h-6" />
        </button>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-start space-x-2">
          <Eye className="w-5 h-5 text-gray-600" />
          <div>
            <div>Где посмотреть</div>
            <div className="text-teal-600">в 41 салонах</div>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Truck className="w-5 h-5 text-gray-600" />
          <div>
            <div>Доставка на дом</div>
            <div>1000 ₽</div>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Box className="w-5 h-5 text-gray-600" />
          <div>
            <div>Самовывоз</div>
            <div>бесплатно</div>
            <div className="text-teal-600">в 1 пункте выдачи</div>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <ArrowLeftRight className="w-5 h-5 text-gray-600" />
          <div>
            <div>Легкий обмен</div>
            <div>в течение 90 дней</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <a href="#" className="text-teal-600 hover:text-teal-700 text-sm">
          Дополнительные услуги
        </a>
      </div>
    </div>
  );
};

export default ProductInfo;