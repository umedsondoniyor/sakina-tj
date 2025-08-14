import React from 'react';
import { X } from 'lucide-react';
import type { ProductVariant } from '../../lib/types';

interface PillowConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  productName: string;
  selectedVariant: ProductVariant;
}

const PillowConfirmationModal: React.FC<PillowConfirmationModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  productName,
  selectedVariant
}) => {
  if (!isOpen) return null;

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
          <h3 className="text-lg font-medium mb-4">Конфигурация подушки</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Размер</span>
              <span className="text-sm text-teal-600 flex items-center">
                {selectedVariant.size_name}
                {selectedVariant.height_cm && `, h - ${selectedVariant.height_cm} см`}
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
            В корзину • {selectedVariant.price.toLocaleString()} с.
          </button>
        </div>
      </div>
    </div>
  );
};

export default PillowConfirmationModal;