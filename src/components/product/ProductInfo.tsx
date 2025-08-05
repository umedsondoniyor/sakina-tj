import React from 'react';
import { Star, Heart, Eye, Truck, Box, ArrowLeftRight } from 'lucide-react';
import type { Product, ProductVariant } from '../../lib/types';
import { getProductVariants } from '../../lib/api';
import { useCart } from '../../contexts/CartContext';

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
            {getCurrentPrice().toLocaleString()} ₽
            {getCurrentOldPrice() && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                {getCurrentOldPrice()!.toLocaleString()} ₽
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
                  disabled={!variant.in_stock}
                  className={`p-2 text-center border rounded-lg transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-500'
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
                    {variant.price.toLocaleString()} ₽
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
                  {price.toLocaleString()} ₽
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

      {/* Product Description and Characteristics */}
      <div className="mt-12 space-y-8">
        {/* Description Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">О товаре</h2>
          
          {product.description ? (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">
                {product.description}
              </p>
            </div>
          ) : (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">
                Инновационный двусторонний матрас {product.name} создан для тех, кто ценит простоту и комфорт. 
                Одна сторона обеспечивает мягкую поддержку для расслабления, а другая — более упругую для активного восстановления. 
                Независимые пружины адаптируются под контуры тела, обеспечивая правильное положение позвоночника во время сна.
              </p>
            </div>
          )}
        </div>

        {/* Characteristics Table */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Характеристики</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {/* Height */}
              {selectedVariant?.height_cm && (
                <div className="flex py-4 px-6">
                  <div className="w-1/3 text-gray-600">Высота</div>
                  <div className="w-2/3 font-medium">{selectedVariant.height_cm} см</div>
                </div>
              )}
              
              {/* Hardness */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Жесткость</div>
                <div className="w-2/3 font-medium">Средняя</div>
              </div>
              
              {/* Spring count */}
              {product.category === 'mattresses' && (
                <div className="flex py-4 px-6">
                  <div className="w-1/3 text-gray-600">Количество пружин</div>
                  <div className="w-2/3 font-medium">500</div>
                </div>
              )}
              
              {/* Spring type */}
              {product.category === 'mattresses' && (
                <div className="flex py-4 px-6">
                  <div className="w-1/3 text-gray-600">Пружинный блок</div>
                  <div className="w-2/3 font-medium">Независимый</div>
                </div>
              )}
              
              {/* Maximum weight */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Вес на спальное место, до</div>
                <div className="w-2/3 font-medium">90 кг</div>
              </div>
              
              {/* Filling */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Наполнитель</div>
                <div className="w-2/3 font-medium">
                  {product.category === 'pillows' ? 'Memory Foam' : 'Анатомическая пена + кокосовая койра'}
                </div>
              </div>
              
              {/* Cover material */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Материал чехла</div>
                <div className="w-2/3 font-medium">Трикотажный жаккард</div>
              </div>
              
              {/* Cover type */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Съемный чехол</div>
                <div className="w-2/3 font-medium">Нет</div>
              </div>
              
              {/* Spring block */}
              {product.category === 'mattresses' && (
                <div className="flex py-4 px-6">
                  <div className="w-1/3 text-gray-600">Пружинный блок</div>
                  <div className="w-2/3 font-medium">Блок независимых пружин</div>
                </div>
              )}
              
              {/* Warranty */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Гарантия</div>
                <div className="w-2/3 font-medium">1.5 года</div>
              </div>
              
              {/* Recommended mattress pad */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Рекомендуемый наматрасник</div>
                <div className="w-2/3 font-medium">1 слой</div>
              </div>
              
              {/* Category */}
              <div className="flex py-4 px-6">
                <div className="w-1/3 text-gray-600">Категория</div>
                <div className="w-2/3 font-medium capitalize">
                  {product.category === 'mattresses' ? 'Матрасы' : 
                   product.category === 'pillows' ? 'Подушки' : 
                   product.category === 'beds' ? 'Кровати' : product.category}
                </div>
              </div>
            </div>
          </div>
          
          {/* Show more link */}
          <div className="mt-4">
            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
              Смотреть все характеристики →
            </button>
          </div>
        </div>

        {/* Guarantees Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Гарантии</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Гарантия на товар 1.5 года</div>
                <div className="text-sm text-gray-600">35 лет при покупке с чехлом</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Бесплатная доставка</div>
                <div className="text-sm text-gray-600">при заказе от 3 товаров</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Дополнительно</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-teal-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Доставляется в сжатом виде, до 4 раз. Comfort Plus до 2102-2024 года</p>
                <p>Внимание! Покупая два матраса одного размера, вы экономите производственные затраты и получаете скидку 5% на общую сумму заказа.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description and Characteristics */}
        <div className="mt-8 space-y-6">
          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-xl font-semibold text-brand-navy mb-4">Описание товара</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          )}

          {/* Characteristics */}
          <div>
            <h3 className="text-xl font-semibold text-brand-navy mb-4">Характеристики</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Product Info */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Категория:</span>
                    <span className="font-medium capitalize">{product.category}</span>
                  </div>
                  
                  {selectedVariant && (
                    <>
                      {selectedVariant.width_cm && selectedVariant.length_cm && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Размер (Ш×Д):</span>
                          <span className="font-medium">{selectedVariant.width_cm}×{selectedVariant.length_cm} см</span>
                        </div>
                      )}
                      
                      {selectedVariant.height_cm && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Высота:</span>
                          <span className="font-medium">{selectedVariant.height_cm} см</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Тип размера:</span>
                        <span className="font-medium capitalize">{selectedVariant.size_type}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Рейтинг:</span>
                    <span className="font-medium">{product.rating}/5 ({product.review_count} отзывов)</span>
                  </div>
                </div>

                {/* Additional Characteristics */}
                <div className="space-y-3">
                  {product.category === 'mattresses' && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Тип матраса:</span>
                        <span className="font-medium">Ортопедический</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Жесткость:</span>
                        <span className="font-medium">Средняя</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Пружинный блок:</span>
                        <span className="font-medium">Независимый</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Материал чехла:</span>
                        <span className="font-medium">Трикотаж</span>
                      </div>
                    </>
                  )}
                  
                  {product.category === 'pillows' && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Тип подушки:</span>
                        <span className="font-medium">Анатомическая</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Наполнитель:</span>
                        <span className="font-medium">Memory Foam</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Жесткость:</span>
                        <span className="font-medium">Средняя</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Гарантия:</span>
                    <span className="font-medium">8 лет</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Страна производства:</span>
                    <span className="font-medium">Таджикистан</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Care Instructions */}
          <div>
            <h3 className="text-xl font-semibold text-brand-navy mb-4">Уход за изделием</h3>
            <div className="bg-blue-50 rounded-lg p-6">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Регулярно проветривайте матрас
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Используйте наматрасник для защиты от загрязнений
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Переворачивайте матрас каждые 3 месяца
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Избегайте прямого воздействия солнечных лучей
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;