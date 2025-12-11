import React from 'react';
import { X, CheckCircle, XCircle, Package } from 'lucide-react';
import type { ProductVariant } from '../../lib/types';
import { formatCurrency, getVariantLabel } from '../../lib/utils';

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

  const getTitle = () => {
    if (isPillow) return 'Конфигурация подушки';
    if (isMattress) return 'Размер (Ш×Д)';
    if (isBed) return 'Размер кровати';
    return 'Выберите размер';
  };

  // Improved stock check: consider both in_stock flag and stock_quantity
  const isVariantInStock = (variant: ProductVariant): boolean => {
    if (!variant.inventory) {
      // If no inventory record exists, assume it's available (might be a new variant)
      return true;
    }
    // Check both in_stock flag and stock_quantity
    return variant.inventory.in_stock || variant.inventory.stock_quantity > 0;
  };

  const getStockQuantity = (variant: ProductVariant): number => {
    return variant.inventory?.stock_quantity ?? 0;
  };

  const getStockStatus = (variant: ProductVariant) => {
    const inStock = isVariantInStock(variant);
    const quantity = getStockQuantity(variant);
    
    return {
      inStock,
      quantity,
      label: inStock 
        ? quantity > 0 
          ? `в наличии (${quantity} шт.)`
          : 'в наличии'
        : 'нет в наличии',
      color: inStock ? 'text-teal-600' : 'text-red-600',
      bgColor: inStock ? 'bg-teal-50' : 'bg-red-50',
      icon: inStock ? CheckCircle : XCircle,
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Выберите конфигурацию</h2>
              <p className="text-teal-100 text-sm mt-1">{productName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-100 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              aria-label="Закрыть"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTitle()}</h3>

          {variants.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Размеры для этого товара не настроены</p>
              <p className="text-sm text-gray-500 mt-2">Обратитесь к администратору</p>
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant) => {
                const stockStatus = getStockStatus(variant);
                const StockIcon = stockStatus.icon;
                const isAvailable = stockStatus.inStock;

                return (
                  <button
                    key={variant.id}
                    onClick={() => isAvailable && onSelectSize(variant)}
                    disabled={!isAvailable}
                    className={`
                      w-full p-4 border-2 rounded-xl transition-all duration-200 text-left
                      ${
                        isAvailable
                          ? 'border-gray-200 hover:border-teal-500 hover:shadow-md bg-white cursor-pointer'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-75'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Size info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-1">
                          {getVariantLabel(variant, category)}
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${stockStatus.color}`}>
                          <StockIcon size={16} className="flex-shrink-0" />
                          <span className="font-medium">{stockStatus.label}</span>
                        </div>
                      </div>

                      {/* Right: Price */}
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-lg font-bold ${!isAvailable ? 'text-gray-400' : 'text-gray-900'}`}>
                          {formatCurrency(variant.price)}
                        </div>
                        {variant.old_price && variant.old_price > 0 && variant.old_price > variant.price && (
                          <div className="text-sm text-gray-500 line-through mt-1">
                            {formatCurrency(variant.old_price)}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer info */}
          {variants.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Выберите размер для продолжения оформления заказа
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSizeModal;
