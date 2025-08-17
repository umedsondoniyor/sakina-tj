import React from 'react';
import { CreditCard, Home, Info, Smartphone, Wallet, Handshake } from 'lucide-react';

interface PaymentMethodFormProps {
  paymentMethod: 'online' | 'cash' | 'installment';
  onPaymentMethodChange: (method: 'online' | 'cash' | 'installment') => void;
  selectedGateway?: string;
  onGatewayChange?: (gateway: string) => void;
}

const paymentGateways = [
  {
    value: 'korti_milli',
    label: 'Корти Милли',
    description: 'Национальная платежная система',
    icon: CreditCard,
    color: 'bg-blue-500'
  },
    {
    value: 'wallet',
    label: 'Alif Wallet',
    description: 'Электронный кошелек Alif',
    icon: Wallet,
    color: 'bg-green-500'
  },
  {
    value: 'salom',
    label: 'Alif Salom',
    description: 'Купите сейчас, оплачивайте потом',
    icon: Handshake,
    color: 'bg-green-500'
  },
  {
    value: 'vsa',
    label: 'Visa',
    description: 'Международные карты Visa',
    icon: CreditCard,
    color: 'bg-blue-600'
  },
  {
    value: 'mcr',
    label: 'Mastercard',
    description: 'Международные карты Mastercard',
    icon: CreditCard,
    color: 'bg-red-500'
  },
  {
    value: 'tcell',
    label: 'Tcell',
    description: 'Мобильные платежи Tcell',
    icon: Smartphone,
    color: 'bg-purple-600'
  },
  {
    value: 'megafon',
    label: 'Megafon',
    description: 'Мобильные платежи Megafon',
    icon: Smartphone,
    color: 'bg-green-600'
  },
  {
    value: 'babilon',
    label: 'Babilon',
    description: 'Платежная система Babilon',
    icon: CreditCard,
    color: 'bg-orange-500'
  },
  {
    value: 'zetmobile',
    label: 'Zet Mobile',
    description: 'Мобильные платежи Zet',
    icon: Smartphone,
    color: 'bg-indigo-500'
  }
];
const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  selectedGateway = 'korti_milli',
  onGatewayChange
}) => {

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <CreditCard className="mr-2" size={24} />
        Способ оплаты
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <p className="text-sm text-gray-600">Visa, Mastercard</p>
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
            <p className="text-sm text-gray-600">4 платежа по 2735 с. без переплат</p>
            <Info className="mx-auto mt-1 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Gateway Selection for Online Payment */}
      {paymentMethod === 'online' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Выберите способ онлайн оплаты</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paymentGateways.map((gateway) => (
              <button
                key={gateway.value}
                type="button"
                onClick={() => onGatewayChange?.(gateway.value)}
                className={`p-4 border rounded-lg transition-all text-left ${
                  selectedGateway === gateway.value
                    ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${gateway.color} rounded-lg flex items-center justify-center`}>
                    <gateway.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{gateway.label}</h4>
                    <p className="text-xs text-gray-600">{gateway.description}</p>
                  </div>
                  {selectedGateway === gateway.value && (
                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {paymentMethod === 'online' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-blue-700">
            <Info size={16} className="mr-2" />
            <span className="text-sm">После подтверждения заказа вы будете перенаправлены на безопасную страницу Alif Bank для завершения платежа.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodForm;