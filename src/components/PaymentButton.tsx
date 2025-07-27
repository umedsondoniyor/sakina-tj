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
      // Check if we're in development mode and Edge Functions are not available
      const isDevelopment = import.meta.env.DEV;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured. Please check your environment variables.');
      }

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
      let data, functionError;
      
      try {
        const result = await supabase.functions.invoke(
          'alif-payment-init',
          {
            body: {
              amount,
              currency,
              orderData: enhancedOrderData,
              gate
            },
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            }
          }
        );
        data = result.data;
        functionError = result.error;
      } catch (invokeError) {
        console.error('Edge Function invocation failed:', invokeError);
        
        if (isDevelopment) {
          // In development, show helpful error message
          throw new Error(`
            Edge Function не развернута или недоступна.
            
            Для исправления:
            1. Убедитесь, что Supabase CLI установлен
            2. Выполните: supabase login
            3. Выполните: supabase link --project-ref ${supabaseUrl.split('//')[1].split('.')[0]}
            4. Выполните: supabase functions deploy
            
            Или проверьте настройки Edge Functions в панели Supabase.
          `);
        } else {
          throw new Error('Сервис платежей временно недоступен. Попробуйте позже.');
        }
      }

      if (functionError) {
        console.error('Supabase function error details:', {
          message: functionError.message,
          details: functionError.details,
          hint: functionError.hint,
          code: functionError.code
        });
        
        if (functionError.message?.includes('Function not found')) {
          throw new Error(`
            Edge Function 'alif-payment-init' не найдена.
            
            Проверьте:
            1. Функция развернута в Supabase
            2. Имя функции указано правильно
            3. У вас есть права доступа к функции
          `);
        }
        
        throw new Error(`Edge Function Error: ${functionError.message || 'Payment initialization failed'}`);
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