import React, { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  orderData: {
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
    }>;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    deliveryInfo: {
      type: string;
      address?: string;
    };
    invoices?: {
      is_hold_required?: boolean;
      is_outbox_marked?: boolean;
    };
  };
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  gate?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  currency = 'TJS',
  orderData,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children,
  gate = 'korti_milli'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async () => {
    if (!orderData.customerInfo.email || !orderData.customerInfo.name) {
      const errorMsg = 'Необходимо заполнить контактную информацию';
      setError(errorMsg);
      onError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare order data with invoices structure for Alif Bank
      const enhancedOrderData = {
        ...orderData,
        invoices: {
          invoices: orderData.items.map(item => ({
            category: item.category || 'general',
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          is_hold_required: orderData.invoices?.is_hold_required || false,
          is_outbox_marked: orderData.invoices?.is_outbox_marked || false
        }
      };

      // Call Supabase Edge Function to initialize payment
      const { data, error: functionError } = await supabase.functions.invoke(
        'alif-payment-init',
        {
          body: {
            amount,
            currency,
            orderData: enhancedOrderData,
            gate
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Payment initialization failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Store payment info for later reference
      sessionStorage.setItem('sakina_payment_id', data.payment_id);
      sessionStorage.setItem('sakina_order_id', data.order_id);

      // Redirect to Alif Bank payment page
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('Payment URL not received from Alif Bank');
      }

      // Call success callback
      onSuccess?.(data.payment_id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при инициализации платежа';
      console.error('Payment initiation error:', err);
      
      setError(errorMessage);
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={initiatePayment}
        disabled={disabled || loading}
        className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition-colors ${
          disabled || loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-teal-500 hover:bg-teal-600 text-white'
        } ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Обработка платежа...
          </>
        ) : (
          <>
            <CreditCard className="mr-2" size={20} />
            {children || `Оплатить ${amount.toLocaleString()} ${currency}`}
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>Безопасная оплата через Alif Bank</p>
        <p>Поддерживаются карты Visa, Mastercard, МИР</p>
      </div>
    </div>
  );
};

export default PaymentButton;