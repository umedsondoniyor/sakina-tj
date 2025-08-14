import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { CartItem } from '../../lib/types';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  showOrderSummary: boolean;
  onToggleOrderSummary: () => void;
  calculateDeliveryFee: () => number;
  calculateDiscount: () => number;
  calculateFinalTotal: () => number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  total,
  showOrderSummary,
  onToggleOrderSummary,
  calculateDeliveryFee,
  calculateDiscount,
  calculateFinalTotal
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Состав заказа ({items.length})</h3>
        <button
          onClick={onToggleOrderSummary}
          className="lg:hidden"
        >
          <ChevronDown className={`transform transition-transform ${
            showOrderSummary ? 'rotate-180' : ''
          }`} size={20} />
        </button>
      </div>

      <div className={`space-y-4 ${showOrderSummary ? 'block' : 'hidden lg:block'}`}>
        {items.map((item) => (
          <div key={item.id} className="flex space-x-3">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.name}</h4>
              {item.size && (
                <p className="text-sm text-gray-600">{item.size}</p>
              )}
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium">{item.price.toLocaleString()} с.</span>
                <span className="text-sm text-gray-600">{item.quantity} шт.</span>
              </div>
            </div>
          </div>
        ))}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Товары ({items.length})</span>
            <span>{total.toLocaleString()} с.</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Скидка</span>
            <span className="text-red-600">-{calculateDiscount().toLocaleString()} с.</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Доставка</span>
            <span>{calculateDeliveryFee().toLocaleString()} с.</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Итого</span>
              <span>{calculateFinalTotal().toLocaleString()} с.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;