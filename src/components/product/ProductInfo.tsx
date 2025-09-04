import React from 'react';
import { Star, Eye, Truck, Box, ArrowLeftRight, ShoppingBag } from 'lucide-react';
import type { Product, ProductVariant } from '../../lib/types';
import { getProductVariants } from '../../lib/api';
import { useCart } from '../../contexts/CartContext';
import OneClickModal from '../OneClickModal';
import { useNavigate } from 'react-router-dom';

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  onAddToCart: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  onVariantChange,
  onAddToCart
}) => {
  const [variants, setVariants] = React.useState<ProductVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = React.useState(false);
  const [showOneClickModal, setShowOneClickModal] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (product.id) {
      loadVariants();
    }
  }, [product.id]);

  const loadVariants = async () => {
    try {
      setLoadingVariants(true);
      const data = await getProductVariants(product.id);
      setVariants(data);
      
      // Auto-select first available variant
      if (data.length > 0 && !selectedVariant) {
        const firstAvailable = data.find(v => v.in_stock) || data[0];
        onVariantChange(firstAvailable);
      }
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setLoadingVariants(false);
    }
  };

  const getCurrentPrice = () => {
    return selectedVariant ? selectedVariant.price : product.price;
  };

  const getCurrentOldPrice = () => {
    return selectedVariant ? selectedVariant.old_price : product.old_price;
  };

  const handleOneClickSuccess = (orderId: string) => {
    navigate(`/one-click-confirmation/${orderId}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
         {product.name}
      </h1>
      
      {product.weight_category && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-teal-700">
              Рекомендуемый вес: {product.weight_category}
            </span>
          </div>
        </div>
      )}
      
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
            {getCurrentPrice().toLocaleString()} с.
            {getCurrentOldPrice() && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                {getCurrentOldPrice()!.toLocaleString()} с.
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            + 2 694 бонусов
          </div>
        </div>
      </div>

      {/* Variant Selection */}
      {variants.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">
              {product.category === 'pillows' ? 'Размер' : 'Размер (Ш×Д)'}
            </h3>
            <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
              Все размеры ({variants.length})
            </a>
          </div>
          
          {loadingVariants ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => onVariantChange(variant)}
                  disabled={!variant.inventory?.in_stock}
                  className={`p-2 text-center border rounded-lg transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'border-teal-500 bg-teal-50'
                      : variant.inventory?.in_stock 
                        ? 'border-gray-200 hover:border-teal-500'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-medium">
                    {product.category === 'pillows' && variant.height_cm
                      ? `${variant.size_name}, h - ${variant.height_cm}см`
                      : variant.width_cm && variant.length_cm
                      ? `${variant.width_cm}×${variant.length_cm}`
                      : variant.size_name
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {variant.price.toLocaleString()} с.
                  </div>
                  <div className="text-xs">
                    {variant.inventory?.in_stock ? (
                      <span className="text-teal-600">
                        В наличии {variant.inventory?.stock_quantity ? `(${variant.inventory.stock_quantity})` : ''}
                      </span>
                    ) : (
                      <span className="text-red-600">Нет в наличии</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fallback for products without variants */}
      {variants.length === 0 && !loadingVariants && (
        <div className="mb-6">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              Размеры для этого товара настраиваются администратором
            </p>
          </div>
        </div>
      )}

      {/* Size Selection - Legacy fallback */}
      {product.category === 'mattresses' && variants.length === 0 && !loadingVariants && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Размер (Ш×Д)</h3>
            <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
              Все размеры
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { size: '80×200', price: 36139 },
              { size: '90×200', price: 38977 },
              { size: '140×200', price: 49895 },
              { size: '160×200', price: 53880 },
              { size: '180×200', price: 59064 },
            ].map(({ size, price }) => (
              <button
                key={size}
                className={`p-2 text-center border rounded-lg transition-colors ${
                  true
                    ? 'border-gray-200 hover:border-teal-500'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="font-medium">{size}</div>
                <div className="text-sm text-gray-600">
                  {price.toLocaleString()} с.
                </div>
                <div className="text-xs text-teal-600">В наличии</div>
              </button>
            ))}
          </div>
        </div>
      )}

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
        <button 
          onClick={() => setShowOneClickModal(true)}
          className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          <span className="font-medium">Купить в 1 клик</span>
        </button>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-start space-x-2">
          <Eye className="w-5 h-5 text-gray-600" />
          <div>
            <div>Где посмотреть</div>
            <a href="https://maps.app.goo.gl/5exgpkraKy9foeD27" target="_blank" rel="noopener noreferrer" class="flex items-start gap-2 text-left text-gray-700 hover:text-teal-600">
              <div className="text-teal-600">Душанбе, Пулоди 4</div>
            </a>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Truck className="w-5 h-5 text-gray-600" />
          <div>
            <div>Доставим по г.</div>
            <div>Душанбе на дом</div>
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
            <div>Без обмен</div>
            <div>в течение дней</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <a href="#" className="text-teal-600 hover:text-teal-700 text-sm">
          Дополнительные услуги
        </a>
      </div>

      {/* One Click Modal */}
      <OneClickModal
        isOpen={showOneClickModal}
        onClose={() => setShowOneClickModal(false)}
        product={product}
        selectedVariant={selectedVariant}
        onSuccess={handleOneClickSuccess}
      />
    </div>
  );
};

export default ProductInfo;