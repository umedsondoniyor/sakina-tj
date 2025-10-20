import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product, ProductVariant } from '../../lib/types';

interface ProductCharacteristicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant: ProductVariant | null;
}

const ProductCharacteristicsModal: React.FC<ProductCharacteristicsModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // universal safe value filter
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

  const price = selectedVariant?.price ?? product.price;
  const oldPrice = selectedVariant?.old_price ?? product.old_price;

  const sections = [
    {
      category: 'Основные характеристики',
      items: [
        { label: 'Категория', value: product.category },
        { label: 'Тип матраса', value: safeValue(product.mattress_type) },
        {
          label: 'Размер (Ш×Д)',
          value:
            selectedVariant?.width_cm && selectedVariant?.length_cm
              ? `${selectedVariant.width_cm}×${selectedVariant.length_cm} см`
              : selectedVariant?.size_name
        },
        {
          label: 'Высота',
          value: safeValue(selectedVariant?.height_cm, ' см')
        },
        { label: 'Жесткость', value: safeValue(product.hardness) },
        { label: 'Весовая категория', value: safeValue(product.weight_category) }
      ]
    },
    {
      category: 'Конструкция',
      items: [
        { label: 'Пружинный блок', value: safeValue(product.spring_block_type) },
        {
          label: 'Количество пружин',
          value: safeValue(product.spring_count)
        },
        { label: 'Материал чехла', value: safeValue(product.cover_material) },
        {
          label: 'Съемный чехол',
          value:
            product.removable_cover !== undefined
              ? product.removable_cover
                ? 'Да'
                : 'Нет'
              : null
        },
        { label: 'Наполнитель', value: safeValue(product.filler_material) }
      ]
    },
    {
      category: 'Дополнительная информация',
      items: [
        {
          label: 'Гарантия',
          value: safeValue(product.warranty_years, ' лет')
        },
        {
          label: 'Рекомендуемый наматрасник',
          value: safeValue(product.recommended_mattress_pad)
        },
        {
          label: 'Страна производства',
          value: safeValue(product.country_of_origin || 'Таджикистан')
        },
        product.rating
          ? {
              label: 'Рейтинг',
              value: `${product.rating}/5${
                product.review_count
                  ? ` (${product.review_count} отзывов)`
                  : ''
              }`
            }
          : null
      ].filter(Boolean)
    },
    {
      category: 'Цена и наличие',
      items: [
        price && { label: 'Цена', value: `${price.toLocaleString()} с.` },
        oldPrice && {
          label: 'Старая цена',
          value: `${oldPrice.toLocaleString()} с.`
        },
        product.sale_percentage && {
          label: 'Скидка',
          value: `${product.sale_percentage}%`
        }
      ].filter(Boolean)
    }
  ].filter(section =>
    section.items.some(item => item && item.value !== null)
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen
          ? 'opacity-100 pointer-events-auto bg-black/50'
          : 'opacity-0 pointer-events-none bg-transparent'
      }`}
      aria-hidden={!isOpen}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Все характеристики</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-brand-navy mb-2">
              {product.name}
            </h3>
            {selectedVariant && (
              <p className="text-gray-600 text-sm">
                Выбранный размер:{' '}
                {selectedVariant.width_cm && selectedVariant.length_cm
                  ? `${selectedVariant.width_cm}×${selectedVariant.length_cm} см`
                  : selectedVariant.size_name || '—'}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h4 className="text-lg font-semibold text-brand-navy mb-4 border-b border-gray-200 pb-2">
                  {section.category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items
                    .filter(item => item && item.value !== null)
                    .map((item, j) => (
                      <div
                        key={j}
                        className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-600 font-medium">
                          {item.label}:
                        </span>
                        <span className="font-semibold text-brand-navy text-right">
                          {item.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 pt-8 border-t">
              <h4 className="text-lg font-semibold text-brand-navy mb-4">
                Описание товара
              </h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Care Instructions */}
          <div className="mt-8 pt-8 border-t">
            <h4 className="text-lg font-semibold text-brand-navy mb-4">
              Уход за изделием
            </h4>
            <ul className="bg-blue-50 rounded-lg p-6 space-y-3 text-sm text-gray-700 list-none">
              {[
                'Регулярно проветривайте матрас для поддержания свежести',
                'Используйте наматрасник для защиты от загрязнений и продления срока службы',
                'Переворачивайте матрас каждые 3 месяца для равномерного износа',
                'Избегайте прямого воздействия солнечных лучей и влаги',
                'Не складывайте и не сгибайте матрас'
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-brand-turquoise text-white py-3 rounded-lg hover:bg-brand-navy transition-colors font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCharacteristicsModal;
