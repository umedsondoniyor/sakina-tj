import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import type { Product, ProductVariant } from '../lib/types';

// Subcomponents
import ProductBreadcrumbs from './product/ProductBreadcrumbs';
import ProductImageGallery from './product/ProductImageGallery';
import ProductInfo from './product/ProductInfo';
import ProductLoadingState from './product/ProductLoadingState';
import ProductNotFound from './product/ProductNotFound';
import ProductCharacteristicsModal from './product/ProductCharacteristicsModal';

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCharacteristicsModal, setShowCharacteristicsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧩 Universal safe value helper
  const safeValue = (value: any, suffix = ''): string | null => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 0 ||
      value === '0'
    ) {
      return null;
    }
    return `${value}${suffix}`;
  };

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await getProducts();
        const found = products.find(p => p.id === id);
        setProduct(found || null);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Не удалось загрузить данные о товаре.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const variant = selectedVariant;
    const price = variant?.price ?? product.price;

    const cartItem = {
      id: variant ? `${product.id}_${variant.id}` : product.id,
      name: product.name,
      price,
      quantity: 1,
      image_url: product.image_urls?.[0] || '/placeholder.png',
      size: variant
        ? variant.width_cm && variant.length_cm
          ? `${variant.width_cm}×${variant.length_cm} см`
          : variant.size_name
        : undefined,
      variant_id: variant?.id
    };

    addItem(cartItem);
  };

  const productImages = useMemo(() => product?.image_urls || [], [product]);

  if (loading) return <ProductLoadingState />;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;
  if (!product) return <ProductNotFound />;

  // Simple reusable component for specs
  const SpecRow = ({
    label,
    value
  }: {
    label: string;
    value?: string | null;
  }) =>
    value ? (
      <div className="flex justify-between py-3 px-6">
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-900 text-right">{value}</span>
      </div>
    ) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <ProductBreadcrumbs productName={product.name} category={product.category} />

      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductImageGallery
          images={productImages}
          productName={product.name}
          salePercentage={product.sale_percentage}
        />

        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* Description and Characteristics */}
      <div className="mt-12 space-y-10">
        {/* Description */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">О товаре</h2>
          {product.description ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          ) : (
            <p className="text-gray-700 leading-relaxed">
              Инновационный матрас {product.name} сочетает комфорт, долговечность и современный дизайн.
              Его структура адаптируется под тело, обеспечивая здоровый сон и поддержку позвоночника.
            </p>
          )}
        </section>

        {/* Characteristics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Характеристики</h2>

          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            <SpecRow
              label="Категория"
              value={
                {
                  mattresses: 'Матрасы',
                  pillows: 'Подушки',
                  beds: 'Кровати',
                  smartchair: 'Массажные кресла',
                  map: 'Карты'
                }[product.category] || product.category
              }
            />

            <SpecRow
              label="Размер (Ш×Д)"
              value={
                selectedVariant?.width_cm && selectedVariant?.length_cm
                  ? `${selectedVariant.width_cm}×${selectedVariant.length_cm} см`
                  : selectedVariant?.size_name
              }
            />

            <SpecRow
              label="Высота"
              value={safeValue(selectedVariant?.height_cm, ' см')}
            />

            <SpecRow
              label="Тип матраса"
              value={safeValue(product.mattress_type)}
            />

            <SpecRow
              label="Жесткость"
              value={safeValue(product.hardness)}
            />

            <SpecRow
              label="Пружинный блок"
              value={safeValue(product.spring_block_type)}
            />

            <SpecRow
              label="Количество пружин"
              value={safeValue(product.spring_count)}
            />

            <SpecRow
              label="Материал чехла"
              value={safeValue(product.cover_material)}
            />

            {product.removable_cover !== undefined && (
              <SpecRow
                label="Съемный чехол"
                value={product.removable_cover ? 'Да' : 'Нет'}
              />
            )}

            <SpecRow
              label="Наполнитель"
              value={safeValue(product.filler_material)}
            />

            <SpecRow
              label="Рекомендуемый наматрасник"
              value={safeValue(product.recommended_mattress_pad)}
            />

            <SpecRow
              label="Гарантия"
              value={safeValue(product.warranty_years, ' лет')}
            />


            <SpecRow
              label="Страна производства"
              value={safeValue(product.country_of_origin || 'Таджикистан')}
            />
          </div>

          <button
            onClick={() => setShowCharacteristicsModal(true)}
            className="mt-4 text-brand-turquoise hover:text-brand-navy text-sm font-medium"
          >
            Смотреть все характеристики →
          </button>
        </section>

        {/* Care Instructions */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Уход за изделием
          </h3>
          <ul className="bg-blue-50 rounded-lg p-6 space-y-2 text-sm text-gray-700">
            {[
              'Регулярно проветривайте матрас',
              'Используйте наматрасник для защиты от загрязнений',
              'Переворачивайте матрас каждые 3 месяца',
              'Избегайте прямого воздействия солнечных лучей'
            ].map((tip, idx) => (
              <li key={idx} className="flex items-start">
                <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Modal */}
      <ProductCharacteristicsModal
        isOpen={showCharacteristicsModal}
        onClose={() => setShowCharacteristicsModal(false)}
        product={product}
        selectedVariant={selectedVariant}
      />
    </div>
  );
};

export default ProductPage;
