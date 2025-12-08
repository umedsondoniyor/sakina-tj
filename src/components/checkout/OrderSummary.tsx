import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { CartItem } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  showOrderSummary: boolean;
  onToggleOrderSummary: () => void;
  calculateDeliveryFee: () => number;
  calculateDiscount: () => number;
  calculateFinalTotal: () => number;
  clubMember?: { discount_percentage: number; member_tier: string; full_name: string } | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  total,
  showOrderSummary,
  onToggleOrderSummary,
  calculateDeliveryFee,
  calculateDiscount,
  calculateFinalTotal,
  clubMember
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
                <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
                <span className="text-sm text-gray-600">{item.quantity} шт.</span>
              </div>
            </div>
          </div>
        ))}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Товары ({items.length})</span>
            <span>{formatCurrency(total)}</span>
          </div>
          
          {calculateDiscount() > 0 && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>Скидка</span>
                {clubMember && (
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                    Клуб Sakina {clubMember.discount_percentage}%
                  </span>
                )}
              </div>
              <span className="text-red-600 font-semibold">-{formatCurrency(calculateDiscount())}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>Доставка</span>
            <span>{formatCurrency(calculateDeliveryFee())}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Итого</span>
              <span>{formatCurrency(calculateFinalTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;