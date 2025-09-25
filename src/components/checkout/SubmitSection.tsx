import React from 'react';
import { Loader2 } from 'lucide-react';
import PaymentButton from '../PaymentButton';
import type { CartItem } from '../../lib/types';

interface SubmitSectionProps {
  paymentMethod: 'online' | 'cash';
  items: CartItem[];
  formData: {
    name: string;
    email: string;
    phone: string;
    deliveryType: 'home' | 'pickup';
    address: string;
  };
  calculateFinalTotal: () => number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  errors: Record<string, string>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  paymentMethod,
  items,
  formData,
  calculateFinalTotal,
  onPaymentSuccess,
  onPaymentError,
  errors,
  loading,
  onSubmit,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {paymentMethod === 'online' ? (
        <PaymentButton
          amount={calculateFinalTotal()}
          currency="TJS"
          gate="alif_bank"
          orderData={{
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              category: 'general'
            })),
            customerInfo: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            },
            deliveryInfo: {
              delivery_type: formData.deliveryType,
              delivery_address: formData.deliveryType === 'home' ? formData.address : null
            },
            invoices: {
              invoices: items.map(item => ({
                category: 'products',
                name: item.name,
                price: item.price,
                quantity: item.quantity
              })),
              is_hold_required: false,
              is_outbox_marked: false
            }
          }}
          onSuccess={onPaymentSuccess}
          onError={onPaymentError}
          disabled={Object.keys(errors).length > 0 || loading}
        >
          Оплатить онлайн
        </PaymentButton>
      ) : (
        <button
          type="submit"
          disabled={loading}
          onClick={onSubmit}
          className="w-full bg-teal-500 text-white py-4 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Обработка заказа...
            </>
          ) : (
            'Оформить заказ'
          )}
        </button>
      )}
      
      <p className="mt-4 text-sm text-gray-600 text-center">
        При оформлении заказа мы осуществляем обработку ваших персональных данных. 
        Указывая свой контактный номер телефона, вы подтверждаете ознакомление{' '}
        <a href="#" className="text-teal-600 hover:text-teal-700">
          с договором-офертой и условиями обработки персональных данных
        </a>.
      </p>
    </div>
  );
};

export default SubmitSection;