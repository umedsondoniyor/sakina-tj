import React from 'react';
import { X } from 'lucide-react';
import type { ProductVariant } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface ProductConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  productName: string;
  selectedVariant: ProductVariant;
  category?: string;
}

const ProductConfirmationModal: React.FC<ProductConfirmationModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  productName,
  selectedVariant,
  category
}) => {
  if (!isOpen) return null;

  const isPillow = category === 'pillows';
  const isMattress = category === 'mattresses';
  const isBed = category === 'beds';

  const getTitle = () => {
    if (isPillow) return 'Конфигурация подушки';
    if (isMattress) return 'Конфигурация матраса';
    if (isBed) return 'Конфигурация кровати';
    return 'Конфигурация товара';
  };

  const getVariantLabel = () => {
    if (isPillow && selectedVariant.height_cm) {
      return `${selectedVariant.size_name}, h - ${selectedVariant.height_cm} см`;
    } else if ((isMattress || isBed) && selectedVariant.width_cm && selectedVariant.length_cm) {
      return `${selectedVariant.width_cm}×${selectedVariant.length_cm}`;
    }
    return selectedVariant.size_name;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Выберите конфигурацию</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">{getTitle()}</h3>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Размер</span>
              <span className="text-sm text-teal-600 flex items-center">
                {getVariantLabel()}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          <button
            onClick={onAddToCart}
            className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors font-medium"
          >
            В корзину • {formatCurrency(selectedVariant.price)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductConfirmationModal;