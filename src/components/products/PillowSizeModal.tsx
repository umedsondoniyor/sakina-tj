import React from 'react';
import { X } from 'lucide-react';
import type { ProductVariant } from '../../lib/types';

interface PillowSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (variant: ProductVariant) => void;
  productName: string;
  variants: ProductVariant[];
}

const PillowSizeModal: React.FC<PillowSizeModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  productName,
  variants
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
          
          <div className="space-y-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelectSize(variant)}
                className={`w-full p-4 border rounded-lg transition-colors text-left ${
                  variant.inventory?.in_stock 
                    ? 'border-gray-200 hover:border-teal-500' 
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                }`}
                disabled={!variant.inventory?.in_stock}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {variant.size_name}
                      {variant.height_cm && `, h - ${variant.height_cm} см`}
                    </div>
                    {variant.inventory?.in_stock ? (
                      <div className="text-sm text-teal-600">в наличии</div>
                    ) : (
                      <div className="text-sm text-red-600">нет в наличии</div>
                    )}
                  </div>
                  <div className={`text-lg font-bold ${!variant.in_stock ? 'text-gray-400' : ''}`}>
                    {variant.price.toLocaleString()} с.
                    {variant.old_price && (
                      <div className="text-sm text-gray-500 line-through">
                        {variant.old_price.toLocaleString()} с.
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {variants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Размеры для этого товара не настроены</p>
              <p className="text-sm">Обратитесь к администратору</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PillowSizeModal;