import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import type { Product, ProductVariant } from '../lib/types';

// Import subcomponents
import ProductBreadcrumbs from './product/ProductBreadcrumbs';
import ProductImageGallery from './product/ProductImageGallery';
import ProductInfo from './product/ProductInfo';
import ProductLoadingState from './product/ProductLoadingState';
import ProductNotFound from './product/ProductNotFound';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);
  const { addItem } = useCart();
  
  React.useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await getProducts();
        const foundProduct = products.find(p => p.id === id);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = selectedVariant ? {
      id: `${product.id}_${selectedVariant.id}`,
      name: product.name,
      price: selectedVariant.price,
      quantity: 1,
      image_url: product.image_urls[0],
      size: product.category === 'pillows' && selectedVariant.height_cm
        ? `${selectedVariant.size_name}, h - ${selectedVariant.height_cm}см`
        : selectedVariant.width_cm && selectedVariant.length_cm
        ? `${selectedVariant.width_cm}×${selectedVariant.length_cm}`
        : selectedVariant.size_name,
      variant_id: selectedVariant.id
    } : {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_urls[0]
    };
    
    addItem(cartItem);
  };

  if (loading) {
    return <ProductLoadingState />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const productImages = product?.image_urls || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <ProductBreadcrumbs productName={product.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <ProductImageGallery
          images={productImages}
          productName={product.name}
          salePercentage={product.sale_percentage}
        />

        {/* Product Info */}
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* Product Description and Characteristics - Full Width */}
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

        {/* Characteristics Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Характеристики</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {/* Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Категория:</span>
                  <span className="font-medium">
                    {product.category === 'mattresses' ? 'Матрасы' : 
                     product.category === 'pillows' ? 'Подушки' : 
                     product.category === 'beds' ? 'Кровати' : product.category}
                  </span>
                </div>
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Тип матраса:</span>
                  <span className="font-medium">Ортопедический</span>
                </div>
              </div>

              {/* Size and Hardness */}
              {selectedVariant && (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  <div className="flex justify-between py-4 px-6">
                    <span className="text-gray-600">Размер (Ш×Д):</span>
                    <span className="font-medium">
                      {selectedVariant.width_cm && selectedVariant.length_cm 
                        ? `${selectedVariant.width_cm}×${selectedVariant.length_cm} см`
                        : selectedVariant.size_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 px-6">
                    <span className="text-gray-600">Жесткость:</span>
                    <span className="font-medium">Средняя</span>
                  </div>
                </div>
              )}

              {/* Height and Spring Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Высота:</span>
                  <span className="font-medium">
                    {selectedVariant?.height_cm ? `${selectedVariant.height_cm} см` : '30 см'}
                  </span>
                </div>
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Пружинный блок:</span>
                  <span className="font-medium">Независимый</span>
                </div>
              </div>

              {/* Type and Material */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Тип размера:</span>
                  <span className="font-medium capitalize">{selectedVariant?.size_type || 'Mattress'}</span>
                </div>
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Материал чехла:</span>
                  <span className="font-medium">Трикотаж</span>
                </div>
              </div>

              {/* Rating and Warranty */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Рейтинг:</span>
                  <span className="font-medium">{product.rating}/5 ({product.review_count} отзывов)</span>
                </div>
                <div className="flex justify-between py-4 px-6">
                  <span className="text-gray-600">Гарантия:</span>
                  <span className="font-medium">8 лет</span>
                </div>
              </div>

              {/* Country of Origin */}
              <div className="flex justify-between py-4 px-6">
                <span className="text-gray-600">Страна производства:</span>
                <span className="font-medium">Таджикистан</span>
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

        {/* Care Instructions */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Уход за изделием</h3>
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
  );
};

export default ProductPage;