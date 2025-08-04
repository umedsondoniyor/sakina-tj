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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured. Please check your environment variables.');
      }

      console.log('🚀 Initiating payment with Supabase URL:', supabaseUrl);
      console.log('📦 Order data:', {
        amount,
        currency,
        customerInfo: orderData.customerInfo,
        itemsCount: orderData.items.length
      });

      // First, test if the Edge Function is accessible
      console.log('🔍 Testing Edge Function accessibility...');
      try {
        const testResponse = await supabase.functions.invoke('alif-payment-init', {
          body: { test: true }
        });
        
        if (testResponse.error) {
          console.error('❌ Edge Function test failed:', testResponse.error);
          throw new Error(`Edge Function not accessible: ${testResponse.error.message}`);
        }
        
        console.log('✅ Edge Function is accessible:', testResponse.data);
      } catch (testError) {
        console.error('❌ Edge Function accessibility test failed:', testError);
        throw new Error(`Edge Function deployment issue: ${testError.message}`);
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

      console.log('📋 Enhanced order data prepared');

      // Call Supabase Edge Function to initialize payment
      console.log('🔄 Calling Edge Function: alif-payment-init');

      console.log(JSON.stringify(enhancedOrderData));
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alif-payment-init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          gate: gate,
          orderData: enhancedOrderData
        })
      });

      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      
      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = JSON.parse(responseText);
          console.error('❌ Edge Function error details:', errorDetails);
          throw new Error(`Edge Function Error: ${errorDetails.error || errorDetails.message || 'Unknown error'}`);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', responseText);
          throw new Error(`Edge Function Error: ${response.status} - ${responseText}`);
        }
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', responseText);
        throw new Error('Invalid response format from payment service');
      }

      if (!data.success) {
        throw new Error(`Payment failed: ${data.error || 'Unknown error'}`);
      }

      console.log('✅ Edge Function response received:', data);

      if (!data.success) {
        console.error('❌ Payment initialization failed:', data.error);
        throw new Error(data.error || 'Payment initialization failed');
      }

      console.log('💳 Payment URL received:', data.payment_url);

      // Store payment info for later reference
      sessionStorage.setItem('sakina_payment_id', data.payment_id);
      sessionStorage.setItem('sakina_order_id', data.order_id);

      // Redirect to Alif Bank payment page
      if (data.payment_url) {
        console.log('🔄 Redirecting to payment page...');
        window.location.href = data.payment_url;
      } else {
        throw new Error('Payment URL not received from Alif Bank');
      }

      // Call success callback
      onSuccess?.(data.payment_id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при инициализации платежа';
      console.error('❌ Payment initiation error:', err);
      
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