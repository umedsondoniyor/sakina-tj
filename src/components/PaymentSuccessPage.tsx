import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Home } from 'lucide-react';
import PaymentStatusChecker from './PaymentStatusChecker';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

/** ---------- Helpers: robust param extraction (query, hash, storage) ---------- */
function useResolvedParam(paramNames: string[], storageKeys: string[] = []) {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    const fromSearch =
      paramNames.map((k) => searchParams.get(k) || '').find(Boolean) || '';

    let fromHash = '';
    if (typeof window !== 'undefined' && window.location?.hash?.includes('?')) {
      const hashQs = new URLSearchParams(window.location.hash.split('?')[1]);
      fromHash = paramNames.map((k) => hashQs.get(k) || '').find(Boolean) || '';
    }

    const fromStorage =
      (typeof window !== 'undefined' &&
        (storageKeys
          .map((k) => sessionStorage.getItem(k) || localStorage.getItem(k) || '')
          .find(Boolean) || '')) ||
      '';

    const raw = fromSearch || fromHash || fromStorage || '';
    const cleaned = decodeURIComponent(raw).trim();

    setValue(cleaned);
  }, [searchParams, paramNames.join('|'), storageKeys.join('|')]);

  useEffect(() => {
    const onHash = () => {
      const hashQs = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const fromHash = paramNames.map((k) => hashQs.get(k) || '').find(Boolean) || '';
      if (fromHash) setValue(decodeURIComponent(fromHash).trim());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [paramNames.join('|')]);

  return value;
}

/** ---------- Types ---------- */
type PaymentRow = {
  id: string;
  alif_order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | string;
  alif_transaction_id?: string;
  created_at?: string;
  updated_at?: string;
};

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const orderId = useResolvedParam(['order_id', 'orderId', 'alif_order_id'], ['sakina_order_id']);
  const paymentId = useResolvedParam(['payment_id', 'paymentId'], ['sakina_payment_id']);

  const [orderCleared, setOrderCleared] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [latestRow, setLatestRow] = useState<PaymentRow | null>(null);

  useEffect(() => {
    if (orderId) {
      try {
        sessionStorage.removeItem('sakina_order_id');
        localStorage.removeItem('sakina_order_id');
      } catch {}
    }
    if (paymentId) {
      try {
        sessionStorage.removeItem('sakina_payment_id');
        localStorage.removeItem('sakina_payment_id');
      } catch {}
    }
  }, [orderId, paymentId]);

  const handleStatusChange = (status: string) => {
    setPaymentStatus(status);
    if (status === 'completed' && !orderCleared) {
      clearCart();
      setOrderCleared(true);
    } else if (status === 'failed' || status === 'cancelled') {
      toast.error('Платеж не был завершен');
    }
  };

  const createdAtStr = useMemo(() => {
    if (!latestRow?.created_at) return null;
    try {
      return new Date(latestRow.created_at).toLocaleString('ru-RU');
    } catch {
      return latestRow.created_at;
    }
  }, [latestRow?.created_at]);

  const headerContent = (() => {
    switch (paymentStatus) {
      case 'completed':
        return {
          icon: <div className="flex justify-center mb-4"><CheckCircle className="text-green-500" size={64} /></div>,
          title: 'Спасибо за заказ!',
          subtitle: 'Ваш платеж успешно обработан'
        };
      case 'failed':
      case 'cancelled':
        return {
          icon: (
            <div className="flex justify-center mb-4">
              <div className="text-red-500">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                </svg>
              </div>
            </div>
          ),
          title: 'Платеж не завершен',
          subtitle: 'Возникла проблема с обработкой платежа'
        };
      default:
        return {
          icon: (
            <div className="flex justify-center mb-4">
              <div className="text-yellow-500">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
            </div>
          ),
          title: 'Обработка платежа',
          subtitle: 'Ваш заказ принят и обрабатывается'
        };
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            {headerContent.icon}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{headerContent.title}</h1>
            <p className="text-gray-600">{headerContent.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Статус платежа</h2>

              {orderId ? (
                <PaymentStatusChecker
                  orderId={orderId}
                  onStatusChange={handleStatusChange}
                  onPaymentUpdate={(row) => setLatestRow(row as PaymentRow | null)}
                  autoRefresh={true}
                  refreshInterval={5000}
                />
              ) : (
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 text-yellow-800">
                  Мы не получили номер заказа из ссылки. Если вы пришли с платежной страницы, обновите страницу,
                  или вернитесь на сайт и повторите оплату.
                </div>
              )}
            </div>
            
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Что дальше?</h2>
              <div className="space-y-4">
                <Step n={1} title="Подтверждение оплаты" text="Мы проверим статус вашего платежа и подтвердим заказ" />
                <Step n={2} title="Обработка заказа" text="Наш менеджер свяжется с вами для уточнения деталей доставки" />
                <Step n={3} title="Доставка" text="Мы доставим ваш заказ в указанное время и место" />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Нужна помощь?</h2>
              <div className="space-y-3">
                <Contact icon={<Package size={20} className="text-teal-600" />} title="Служба поддержки" text="+992 90 533 9595" />
                <Contact icon={<Home size={20} className="text-teal-600" />} title="Email поддержка" text="support@sakina.tj" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center"
              >
                Продолжить покупки
                <ArrowRight size={20} className="ml-2" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** ---------- small presentational helpers ---------- */
const Step = ({ n, title, text }: { n: number; title: string; text: string }) => (
  <div className="flex items-start space-x-3">
    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-teal-600 font-semibold text-sm">{n}</span>
    </div>
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  </div>
);

const Contact = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">{icon}</div>
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  </div>
);

export default PaymentSuccessPage;
