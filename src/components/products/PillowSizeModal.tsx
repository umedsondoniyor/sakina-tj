import React from 'react';
import { X } from 'lucide-react';

interface PillowSize {
  id: string;
  name: string;
  height: string;
  price: number;
  inStock: boolean;
}

interface PillowSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: PillowSize) => void;
  productName: string;
}

const pillowSizes: PillowSize[] = [
  {
    id: 'xs',
    name: 'XS',
    height: 'h - 7 см',
    price: 5999,
    inStock: true
  },
  {
    id: 's',
    name: 'S',
    height: 'h - 9 см',
    price: 5999,
    inStock: true
  },
  {
    id: 'm',
    name: 'M',
    height: 'h - 11,5 см',
    price: 5999,
    inStock: true
  },
  {
    id: 'l',
    name: 'L',
    height: 'h - 14 см',
    price: 5999,
    inStock: true
  }
];

const PillowSizeModal: React.FC<PillowSizeModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  productName
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
            {pillowSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => onSelectSize(size)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-teal-500 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{size.name}, {size.height}</div>
                    {size.inStock && (
                      <div className="text-sm text-teal-600">в наличии</div>
                    )}
                  </div>
                  <div className="text-lg font-bold">
                    {size.price.toLocaleString()} ₽
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Размер</span>
              <span className="text-sm text-teal-600">L, h - 14 см ›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillowSizeModal;