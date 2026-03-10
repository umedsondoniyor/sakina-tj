import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import type { Product, ProductVariant } from '../lib/types';
import type { ProductPageLoaderData } from '../loaders/publicLoaders';
import SEO from './SEO';
import StructuredData from './StructuredData';
import { toAbsoluteUrl } from '../lib/seo';
import { toGa4Item, trackAddToCart, trackViewItem } from '../lib/analytics';

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
  const loaderData = useLoaderData() as ProductPageLoaderData | undefined;
  const initialProduct = loaderData?.product ?? null;
  const initialSimilarProducts = loaderData?.similarProducts ?? [];

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(!initialProduct);
  const [showCharacteristicsModal, setShowCharacteristicsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>(initialSimilarProducts);

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
    if (initialProduct) {
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          setProduct(null);
          return;
        }
        const found = await getProductById(id);
        setProduct(found || null);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Не удалось загрузить данные о товаре.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, initialProduct]);

  useEffect(() => {
    if (!product) {
      return;
    }
    trackViewItem(
      toGa4Item({
        item_id: product.id,
        item_name: product.name,
        price: Number(product.price) || 0,
      }),
    );
  }, [product?.id]);

  useEffect(() => {
    const loadSimilarProducts = async () => {
      if (!product?.category) {
        setSimilarProducts([]);
        return;
      }
      if (initialSimilarProducts.length > 0) {
        setSimilarProducts(initialSimilarProducts);
        return;
      }

      try {
        const sameCategory = await getProductsByCategory(product.category);
        const filtered = sameCategory
          .filter((item) => item.id !== product.id)
          .slice(0, 4);
        setSimilarProducts(filtered);
      } catch (err) {
        console.error('Error loading similar products:', err);
        setSimilarProducts([]);
      }
    };

    loadSimilarProducts();
  }, [product?.id, product?.category, initialSimilarProducts.length]);

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
    trackAddToCart(
      toGa4Item({
        item_id: variant ? `${product.id}_${variant.id}` : product.id,
        item_name: product.name,
        price: Number(price) || 0,
        quantity: 1,
      }),
    );
  };

  const productImages = useMemo(() => product?.image_urls || [], [product]);

  if (loading) return <ProductLoadingState />;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;
  if (!product) return <ProductNotFound />;

  const seoVariant = selectedVariant || product.variants?.[0] || null;
  const seoSize =
    seoVariant?.width_cm && seoVariant?.length_cm
      ? `${seoVariant.width_cm}x${seoVariant.length_cm}`
      : seoVariant?.size_name || '';
  const seoTitle = `Матрас ${product.name}${seoSize ? ` ${seoSize}` : ''}`;
  const seoDescriptionParts = [
    product.mattress_type ? `тип: ${product.mattress_type}` : null,
    product.hardness ? `жесткость: ${product.hardness}` : null,
    product.spring_block_type ? `пружинный блок: ${product.spring_block_type}` : null,
    product.warranty_years ? `гарантия: ${product.warranty_years} лет` : null,
  ].filter(Boolean);
  const seoDescription = `Матрас ${product.name}${seoSize ? ` ${seoSize}` : ''}. ${seoDescriptionParts.join(', ')}. Купить в Душанбе с доставкой.`;
  const canonicalPath = `/products/${product.id}`;
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const primaryImage = product.image_urls?.[0] || product.image_url || '';
  const imageList = (product.image_urls?.length ? product.image_urls : [primaryImage]).filter(Boolean);
  const variantsWithInventory = (product.variants || []).filter((variant: any) => variant.inventory);
  const availability = variantsWithInventory.length > 0
    ? variantsWithInventory.some((variant: any) => variant.inventory?.in_stock === true)
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'
    : 'https://schema.org/InStock';
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageList,
    description: seoDescription,
    offers: {
      '@type': 'Offer',
      price: Number(seoVariant?.price ?? product.price),
      priceCurrency: 'TJS',
      availability,
      url: canonicalUrl,
    },
  };
  if ((product as any).brand) {
    productSchema.brand = {
      '@type': 'Brand',
      name: (product as any).brand,
    };
  }
  if (Number(product.review_count) > 0 && Number(product.rating) > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating),
      reviewCount: Number(product.review_count),
    };
  }

  const maxWeightPerPerson = safeValue(product.weight_category);
  const highlightedHeight = safeValue(seoVariant?.height_cm, ' см');
  const highlightedMaterials = safeValue(product.filler_material || product.cover_material);

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
      <SEO title={seoTitle} description={seoDescription} canonicalPath={canonicalPath} />
      <StructuredData data={productSchema} />
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
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ключевые характеристики</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Жесткость</div>
              <div className="mt-1 text-base font-semibold text-gray-900">{safeValue(product.hardness) || 'Уточняется'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Высота</div>
              <div className="mt-1 text-base font-semibold text-gray-900">{highlightedHeight || 'Уточняется'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Макс. вес на спальное место</div>
              <div className="mt-1 text-base font-semibold text-gray-900">{maxWeightPerPerson || 'Уточняется'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Состав/Наполнители</div>
              <div className="mt-1 text-base font-semibold text-gray-900">{highlightedMaterials || 'Уточняется'}</div>
            </div>
          </div>
        </section>

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

        {similarProducts.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={item.image_url}
                      alt={`матрас ортопедический ${item.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{item.price.toLocaleString('ru-RU')} c.</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
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
