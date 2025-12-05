import React from 'react';
import { X } from 'lucide-react';
import type { ProductVariant } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface ProductSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (variant: ProductVariant) => void;
  productName: string;
  variants: ProductVariant[];
  category?: string;
}

const ProductSizeModal: React.FC<ProductSizeModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  productName,
  variants,
  category
}) => {
  if (!isOpen) return null;

  const isPillow = category === 'pillows';
  const isMattress = category === 'mattresses';
  const isBed = category === 'beds';

  const getVariantLabel = (variant: ProductVariant) => {
    if (isPillow && variant.height_cm) {
      return `${variant.size_name}, h - ${variant.height_cm} см`;
    } else if ((isMattress || isBed) && variant.width_cm && variant.length_cm) {
      return `${variant.width_cm}×${variant.length_cm}`;
    }
    return variant.size_name;
  };

  const getTitle = () => {
    if (isPillow) return 'Конфигурация подушки';
    if (isMattress) return 'Размер (Ш×Д)';
    if (isBed) return 'Размер кровати';
    return 'Выберите размер';
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
                      {getVariantLabel(variant)}
                    </div>
                    {variant.inventory?.in_stock ? (
                      <div className="text-sm text-teal-600">
                        в наличии ({variant.inventory.stock_quantity})
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">нет в наличии</div>
                    )}
                  </div>
                  <div className={`text-lg font-bold ${!variant.inventory?.in_stock ? 'text-gray-400' : ''}`}>
                    {formatCurrency(variant.price)}
                    {variant.old_price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(variant.old_price)}
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

export default ProductSizeModal;