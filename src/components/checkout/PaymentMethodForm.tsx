import React from 'react';
import { CreditCard, Home, Info } from 'lucide-react';

interface PaymentMethodFormProps {
  paymentMethod: 'online' | 'cash' | 'installment';
  onPaymentMethodChange: (method: 'online' | 'cash' | 'installment') => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  onPaymentMethodChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <CreditCard className="mr-2" size={24} />
        Способ оплаты
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Online Payment */}
        <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
          paymentMethod === 'online' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
        }`} onClick={() => onPaymentMethodChange('online')}>
          <div className="text-center">
            <CreditCard className="mx-auto mb-2 text-teal-600" size={32} />
            <input
              type="radio"
              checked={paymentMethod === 'online'}
              onChange={() => onPaymentMethodChange('online')}
              className="mb-2"
            />
            <h3 className="font-medium">Оплата онлайн</h3>
            <p className="text-sm text-gray-600">Visa, Mastercard, МИР, СБП и Халва</p>
          </div>
        </div>

        {/* Cash on Delivery */}
        <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
          paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
        }`} onClick={() => onPaymentMethodChange('cash')}>
          <div className="text-center">
            <Home className="mx-auto mb-2 text-teal-600" size={32} />
            <input
              type="radio"
              checked={paymentMethod === 'cash'}
              onChange={() => onPaymentMethodChange('cash')}
              className="mb-2"
            />
            <h3 className="font-medium">При получении</h3>
            <p className="text-sm text-gray-600">Наличными или картой курьеру</p>
          </div>
        </div>

        {/* Installment */}
        <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
          paymentMethod === 'installment' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
        }`} onClick={() => onPaymentMethodChange('installment')}>
          <div className="text-center">
            <div className="mx-auto mb-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">%</span>
            </div>
            <input
              type="radio"
              checked={paymentMethod === 'installment'}
              onChange={() => onPaymentMethodChange('installment')}
              className="mb-2"
            />
            <h3 className="font-medium">Оплата частями</h3>
            <p className="text-sm text-gray-600">4 платежа по 2735 ₽ без переплат</p>
            <Info className="mx-auto mt-1 text-gray-400" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodForm;