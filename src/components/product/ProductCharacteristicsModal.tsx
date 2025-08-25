import React from 'react';
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
  if (!isOpen) return null;

  const characteristics = [
    {
      category: 'Основные характеристики',
      items: [
        { label: 'Категория', value: product.category === 'mattresses' ? 'Матрасы' : product.category },
        { label: 'Тип матраса', value: product.mattress_type || 'Ортопедический' },
        { label: 'Размер (Ш×Д)', value: selectedVariant?.width_cm && selectedVariant?.length_cm 
          ? `${selectedVariant.width_cm}×${selectedVariant.length_cm} см`
          : 'Не указан' },
        { label: 'Высота', value: selectedVariant?.height_cm ? `${selectedVariant.height_cm} см` : '30 см' },
        { label: 'Жесткость', value: product.hardness || 'Средняя' },
        { label: 'Весовая категория', value: product.weight_category || 'Не указана' }
      ]
    },
    {
      category: 'Конструкция',
      items: [
        { label: 'Пружинный блок', value: product.spring_block_type || 'Независимый' },
        { label: 'Количество пружин', value: product.spring_count ? product.spring_count.toString() : '500' },
        { label: 'Материал чехла', value: product.cover_material || 'Трикотаж' },
        { label: 'Съемный чехол', value: product.removable_cover ? 'Да' : 'Нет' },
        { label: 'Наполнитель', value: product.filler_material || 'Анатомическая пена + кокосовая койра' }
      ]
    },
    {
      category: 'Дополнительная информация',
      items: [
        { label: 'Гарантия', value: `${product.warranty_years || 8} лет` },
        { label: 'Рекомендуемый наматрасник', value: product.recommended_mattress_pad || '1 слой' },
        { label: 'Страна производства', value: product.country_of_origin || 'Таджикистан' },
        { label: 'Рейтинг', value: `${product.rating}/5 (${product.review_count} отзывов)` }
      ]
    },
    {
      category: 'Цена и наличие',
      items: [
        { label: 'Цена', value: `${(selectedVariant?.price || product.price).toLocaleString()} с.` },
        ...(selectedVariant?.old_price || product.old_price ? [{ 
          label: 'Старая цена', 
          value: `${(selectedVariant?.old_price || product.old_price)!.toLocaleString()} с.` 
        }] : []),
        ...(product.sale_percentage ? [{ 
          label: 'Скидка', 
          value: `${product.sale_percentage}%` 
        }] : [])
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Все характеристики</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-brand-navy mb-2">{product.name}</h3>
            {selectedVariant && (
              <p className="text-gray-600">
                Выбранный размер: {selectedVariant.width_cm && selectedVariant.length_cm 
                  ? `${selectedVariant.width_cm}×${selectedVariant.length_cm} см`
                  : selectedVariant.size_name}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {characteristics.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h4 className="text-lg font-semibold text-brand-navy mb-4 border-b border-gray-200 pb-2">
                  {section.category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">{item.label}:</span>
                      <span className="font-semibold text-brand-navy">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mt-8 pt-8 border-t">
              <h4 className="text-lg font-semibold text-brand-navy mb-4">Описание товара</h4>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          )}

          {/* Care Instructions */}
          <div className="mt-8 pt-8 border-t">
            <h4 className="text-lg font-semibold text-brand-navy mb-4">Уход за изделием</h4>
            <div className="bg-blue-50 rounded-lg p-6">
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Регулярно проветривайте матрас для поддержания свежести
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Используйте наматрасник для защиты от загрязнений и продления срока службы
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Переворачивайте матрас каждые 3 месяца для равномерного износа
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Избегайте прямого воздействия солнечных лучей и влаги
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-brand-turquoise rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Не складывайте и не сгибайте матрас
                </li>
              </ul>
            </div>
          </div>
        </div>

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