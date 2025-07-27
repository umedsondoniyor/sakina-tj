import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface PaymentStatusCheckerProps {
  orderId: string;
  onStatusChange?: (status: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface PaymentStatus {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

const PaymentStatusChecker: React.FC<PaymentStatusCheckerProps> = ({
  orderId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkPaymentStatus = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'alif-payment-status',
        {
          body: { order_id: orderId }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to check payment status');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to check payment status');
      }

      setPayment(data.payment);
      setLastChecked(new Date());
      
      // Call status change callback
      if (onStatusChange && data.payment.status !== payment?.status) {
        onStatusChange(data.payment.status);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status';
      console.error('Payment status check error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    // Initial check
    checkPaymentStatus();

    // Set up auto-refresh if enabled and payment is still pending
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        if (payment?.status === 'pending' || payment?.status === 'processing') {
          checkPaymentStatus(false);
        }
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, autoRefresh, refreshInterval, payment?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="text-red-500" size={24} />;
      case 'pending':
      case 'processing':
        return <Clock className="text-yellow-500" size={24} />;
      default:
        return <Clock className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Оплачено';
      case 'failed':
        return 'Ошибка оплаты';
      case 'cancelled':
        return 'Отменено';
      case 'pending':
        return 'Ожидает оплаты';
      case 'processing':
        return 'Обрабатывается';
      default:
        return 'Неизвестный статус';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
      case 'processing':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (loading && !payment) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span>Проверка статуса платежа...</span>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-red-700">
            <XCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => checkPaymentStatus()}
            className="text-red-600 hover:text-red-800"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <span className="text-gray-600">Платеж не найден</span>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor(payment.status)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {getStatusIcon(payment.status)}
          <div className="ml-3">
            <h3 className="font-semibold">{getStatusText(payment.status)}</h3>
            <p className="text-sm opacity-75">
              Заказ #{payment.order_id}
            </p>
          </div>
        </div>
        <button
          onClick={() => checkPaymentStatus()}
          disabled={loading}
          className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Сумма:</span>
          <span className="font-medium">
            {payment.amount.toLocaleString()} {payment.currency}
          </span>
        </div>
        
        {payment.transaction_id && (
          <div className="flex justify-between">
            <span>ID транзакции:</span>
            <span className="font-mono text-xs">{payment.transaction_id}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Создан:</span>
          <span>{new Date(payment.created_at).toLocaleString('ru-RU')}</span>
        </div>
        
        {lastChecked && (
          <div className="flex justify-between text-xs opacity-75">
            <span>Последняя проверка:</span>
            <span>{lastChecked.toLocaleTimeString('ru-RU')}</span>
          </div>
        )}
      </div>

      {(payment.status === 'pending' || payment.status === 'processing') && autoRefresh && (
        <div className="mt-3 text-xs opacity-75">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-2"></div>
            Автоматическое обновление каждые {refreshInterval / 1000} сек.
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusChecker;