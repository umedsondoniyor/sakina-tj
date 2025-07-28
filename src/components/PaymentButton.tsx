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
        invoices: orderData.invoices || {
          invoices: orderData.items.map(item => ({
            category: item.category || 'general',
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          is_hold_required: false,
          is_outbox_marked: false
        }
      };

      // Call Supabase Edge Function to initialize payment
      let data, functionError;
      
      try {
        // Make the function call directly
        const result = await supabase.functions.invoke(
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
        data = result.data;
        functionError = result.error;
      } catch (invokeError: any) {
        console.error('Edge Function accessibility check failed:', invokeError);
        
        const errorMessage = invokeError instanceof Error ? invokeError.message : String(invokeError);
        
        if (errorMessage.includes('FUNCTION_NOT_DEPLOYED') || errorMessage.includes('404')) {
          throw new Error(`❌ Edge Function не развернута

🔧 Для исправления выполните следующие шаги:

1️⃣ Установите Supabase CLI:
   npm install -g supabase

2️⃣ Войдите в аккаунт:
   supabase login

3️⃣ Подключите проект:
   supabase link --project-ref ${supabaseUrl.split('//')[1].split('.')[0]}

4️⃣ Разверните функции:
   supabase functions deploy

📋 Или разверните через панель Supabase:
   Dashboard → Edge Functions → Create Function → Скопируйте код из supabase/functions/alif-payment-init/index.ts`);
        } else if (errorMessage.includes('FUNCTION_UNAUTHORIZED') || errorMessage.includes('401')) {
          throw new Error(`❌ Ошибка авторизации Edge Function

🔧 Проверьте:
• VITE_SUPABASE_ANON_KEY в файле .env
• Настройки RLS для Edge Functions
• Права доступа в Supabase Dashboard`);
        } else if (errorMessage.includes('Failed to send a request') || errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
          throw new Error(`❌ Не удается подключиться к Edge Function

🔧 Возможные причины:
• Edge Function не развернута в Supabase
• Неправильный URL в переменных окружения
• Проблемы с сетевым подключением
• Функция временно недоступна

💡 Решение:
1. Проверьте VITE_SUPABASE_URL в файле .env
2. Разверните Edge Functions: supabase functions deploy
3. Проверьте статус в Supabase Dashboard → Edge Functions`);
        } else {
          throw new Error(`❌ Edge Function недоступна

🔧 Возможные причины:
• Функция не развернута
• Неправильная конфигурация переменных окружения
• Проблемы с сетью

💡 Проверьте статус в Supabase Dashboard → Edge Functions`);
        }
      }

      if (functionError) {
        console.error('Supabase function error details:', {
          message: functionError.message || functionError,
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
        
        throw new Error(`Edge Function Error: ${functionError.message || functionError || 'Payment initialization failed'}`);
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