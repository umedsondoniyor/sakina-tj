import React, { useState } from 'react';
import { CreditCard, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
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
      product_variant_id?: string; // ✅ optional but expected
    }>;
    customerInfo: {
      name: string;
      email?: string;
      phone: string;
    };
    deliveryInfo: {
      delivery_type: string;
      delivery_address?: string | null;
      city?: string;
      apartment?: string;
      entrance?: string;
      floor?: string;
      intercom?: string;
    };
    discount?: number;
    discount_percentage?: number;
    club_member_tier?: string | null;
    subtotal?: number;
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
  gate = 'alif_bank',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async () => {
    if (!orderData.customerInfo.name) {
      const errorMsg = 'Необходимо указать имя';
      setError(errorMsg);
      onError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // PaymentButton is only used for online payments, so always go through payment gateway
    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const defaultLocationId = import.meta.env.VITE_DEFAULT_LOCATION_ID;

      if (!supabaseUrl) throw new Error('Supabase URL not configured');
      if (!defaultLocationId) throw new Error('DEFAULT_LOCATION_ID not configured in .env');

      console.log('🚀 Initiating payment with Supabase URL:', supabaseUrl);
      console.log('📦 Order data:', {
        amount,
        currency,
        customerInfo: orderData.customerInfo,
        itemsCount: orderData.items.length,
      });

      // --- 🧩 Fix variant_id formatting here ---
      const sanitizeVariantId = (val?: string): string | null => {
        if (!val) return null;
        if (val.includes('_')) {
          const parts = val.split('_');
          return parts[1] || parts[0];
        }
        return val;
      };

      // Prepare full payload
      const orderDataWithDelivery = {
        customerInfo: { ...orderData.customerInfo },
        deliveryInfo: { ...orderData.deliveryInfo },
        items: orderData.items.map((item) => ({
          product_variant_id: sanitizeVariantId(item.product_variant_id || item.id), // ✅ ensure valid UUID
          location_id: defaultLocationId, // ✅ fallback for warehouse
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          category: item.category || 'general',
        })),
        discount: orderData.discount || 0,
        discount_percentage: orderData.discount_percentage || 0,
        subtotal: orderData.subtotal || amount,
      };

      console.log('📋 Final order data with variant/location IDs:', orderDataWithDelivery);

      const paymentPayload = {
        amount,
        currency,
        gate,
        orderData: orderDataWithDelivery,
      };

      console.log('📦 Payload:', JSON.stringify(paymentPayload));

      const { data, error } = await supabase.functions.invoke('alif-payment-init', {
        body: paymentPayload,
      });

      console.log('📥 Edge Function response:', { data, error });

      if (error) {
        console.error('❌ Edge Function error:', error);
        // Try to extract error message from error object
        const errorMsg = error.message || error.error || JSON.stringify(error);
        throw new Error(`Edge Function Error: ${errorMsg}`);
      }
      
      if (!data?.success) {
        console.error('❌ Edge Function returned failure:', data);
        const errorMsg = data?.error || data?.message || 'Payment initialization failed';
        throw new Error(errorMsg);
      }

      console.log('✅ Edge Function response received:', data);

      // Save temporary data for callback
      sessionStorage.setItem('sakina_payment_id', data.payment_id);
      sessionStorage.setItem('sakina_order_id', data.order_id)

      if (data.payment_url) {
        console.log('🔄 Redirecting to payment page...');
        window.location.href = data.payment_url;
      } else {
        throw new Error('Payment URL not received from Alif Bank');
      }

      onSuccess?.(data.payment_id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Произошла ошибка при инициализации платежа';
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
            : 'bg-brand-turquoise hover:bg-brand-navy text-white'
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
        <p>Поддерживаются карты Visa, Mastercard</p>
      </div>
    </div>
  );
};

export default PaymentButton;
