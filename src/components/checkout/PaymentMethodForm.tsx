import React from 'react';
import { CreditCard, Home, Info, Lock } from 'lucide-react';

interface PaymentMethodFormProps {
  paymentMethod: 'online' | 'cash' | 'installment';
  onPaymentMethodChange: (method: 'online' | 'cash' | 'installment') => void;
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  onCardDetailsChange?: (field: string, value: string) => void;
  cardErrors?: Record<string, string>;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  onPaymentMethodChange
  cardDetails,
  onCardDetailsChange,
  cardErrors = {}
}) => {
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      onCardDetailsChange?.('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.length <= 5) {
      onCardDetailsChange?.('expiryDate', formatted);
    }
  };

  const handleCvvChange = (value: string) => {
    const v = value.replace(/[^0-9]/gi, '');
    if (v.length <= 4) {
      onCardDetailsChange?.('cvv', v);
    }
  };
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

      {/* Card Details Form - Show only when online payment is selected */}
      {paymentMethod === 'online' && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
          <div className="flex items-center mb-4">
            <Lock className="mr-2 text-teal-600" size={20} />
            <h3 className="font-medium">Данные карты</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер карты *
              </label>
              <input
                type="text"
                value={cardDetails?.cardNumber || ''}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  cardErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {cardErrors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{cardErrors.cardNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Срок действия *
              </label>
              <input
                type="text"
                value={cardDetails?.expiryDate || ''}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  cardErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {cardErrors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{cardErrors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV *
              </label>
              <input
                type="text"
                value={cardDetails?.cvv || ''}
                onChange={(e) => handleCvvChange(e.target.value)}
                placeholder="123"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  cardErrors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {cardErrors.cvv && (
                <p className="mt-1 text-sm text-red-600">{cardErrors.cvv}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя владельца карты *
              </label>
              <input
                type="text"
                value={cardDetails?.cardholderName || ''}
                onChange={(e) => onCardDetailsChange?.('cardholderName', e.target.value.toUpperCase())}
                placeholder="IVAN PETROV"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  cardErrors.cardholderName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {cardErrors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{cardErrors.cardholderName}</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-700">
              <Lock size={16} className="mr-2" />
              <span className="text-sm">Ваши данные защищены SSL-шифрованием</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodForm;