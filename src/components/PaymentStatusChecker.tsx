import React, { useState, useEffect, useRef } from 'react';
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
  alif_order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | string;
  alif_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

const PaymentStatusChecker: React.FC<PaymentStatusCheckerProps> = ({
  orderId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 3000
}) => {
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  const checkPaymentStatus = async (showLoading = true) => {
    if (!orderId) return;
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('payments')
        .select('*')
        .eq('alif_order_id', orderId)
        .order('created_at', { ascending: false }) // latest first
        .limit(1)
        .maybeSingle();

      if (dbError) throw new Error(dbError.message || 'Failed to fetch payment status');

      setLastChecked(new Date());

      if (!data) {
        // Payment record not found yet - show pending state
        setPayment({
          id: 'pending',
          alif_order_id: orderId,
          amount: 0,
          currency: 'TJS',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as PaymentStatus);
        return;
      }

      setPayment(prev => {
        if (onStatusChange && data.status !== prev?.status) {
          onStatusChange(data.status);
        }
        return data as PaymentStatus;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to check payment status';
      console.error('Payment status check error:', err);
      setError(msg);
      // Only show toast error if it's not a "no rows" issue
      if (showLoading && !msg.includes('JSON object requested')) {
        toast.error(msg);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial load + re-check on tab focus (helps mobile/Safari)
  useEffect(() => {
    if (!orderId) return;

    checkPaymentStatus(true);

    const onVis = () => {
      if (document.visibilityState === 'visible') checkPaymentStatus(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [orderId]);

  // Polling loop (don’t depend on status to avoid recreate loops)
  useEffect(() => {
    if (!autoRefresh) return;

    const stop = () => {
      if (intervalRef.current) {
        window.clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const tick = async () => {
      const status = payment?.status ?? 'pending';
      if (status === 'pending' || status === 'processing' || !payment) {
        await checkPaymentStatus(false);
        intervalRef.current = window.setTimeout(tick, refreshInterval);
      } else {
        stop();
      }
    };

    tick();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      case 'pending':
      case 'processing':
      default:          return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':  return 'Оплачено';
      case 'failed':     return 'Ошибка оплаты';
      case 'cancelled':  return 'Отменено';
      case 'pending':    return 'Ожидает оплаты';
      case 'processing': return 'Обрабатывается';
      default:           return 'Неизвестный статус';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':  return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
      case 'cancelled':  return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
      case 'processing':
      default:           return 'text-yellow-700 bg-yellow-50 border-yellow-200';
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
            onClick={() => checkPaymentStatus(true)}
            className="p-1 hover:bg-black/10 rounded"
            aria-label="Обновить статус"
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
      {/* Centered header; icon AFTER text; refresh neatly inside on the right */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-3">
        <div />{/* left spacer to balance the right button */}

        <div className="justify-self-center text-center">
          <h3 className="font-semibold flex items-center justify-center">
            {getStatusText(payment.status)}
            <span className="ml-2">{getStatusIcon(payment.status)}</span>
          </h3>
          <p className="text-sm opacity-75 mt-0.5">
            <span
              className="font-mono text-xs inline-block max-w-[260px] truncate align-top"
              title={`Заказ #${payment.alif_order_id}`}
            >
              Заказ #{payment.alif_order_id}
            </span>
          </p>
                    <button
            onClick={() => checkPaymentStatus(true)}
            disabled={loading}
            className="p-1 hover:bg-black/10 rounded"
            aria-label="Обновить статус"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Сумма:</span>
          <span className="font-medium">
            {payment.amount?.toLocaleString?.() ?? '—'} {payment.currency || ''}
          </span>
        </div>

        {payment.alif_transaction_id && (
          <div className="flex justify-between">
            <span>ID транзакции:</span>
            <span className="font-mono text-xs">{payment.alif_transaction_id}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Создан:</span>
          <span>{payment.created_at ? new Date(payment.created_at).toLocaleString('ru-RU') : '—'}</span>
        </div>

        <div className="flex justify-between">
          <span>Обновлен:</span>
          <span>{payment.updated_at ? new Date(payment.updated_at).toLocaleString('ru-RU') : '—'}</span>
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
            Статус обновляется автоматически (callback от Alif Bank)
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusChecker;
