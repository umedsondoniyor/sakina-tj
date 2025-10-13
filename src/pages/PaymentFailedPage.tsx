// src/pages/PaymentFailedPage.tsx
import React, { useEffect, useState } from 'react';
import { XCircle, RefreshCw, Home, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  /* ---------- Handle order_id from URL, hash, or session ---------- */
  useEffect(() => {
    const fromSearch = searchParams.get('order_id');
    const fromHash = new URLSearchParams(window.location.hash.split('?')[1] || '').get('order_id');
    const id = fromSearch || fromHash;
    if (id) {
      setOrderId(id);
      sessionStorage.setItem('sakina_order_id', id);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      {/* ---------- SEO ---------- */}
      <Helmet>
        <title>Ошибка платежа | Sakina.tj</title>
        <meta
          name="description"
          content="Платеж не был завершен. Попробуйте снова или свяжитесь с поддержкой Sakina.tj."
        />
        <meta property="og:title" content="Ошибка платежа | Sakina.tj" />
        <meta
          property="og:description"
          content="Платеж не прошел. Попробуйте повторить оплату или свяжитесь с нашей службой поддержки."
        />
        <meta property="og:image" content="/og-payment-failed.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* ---------- Header ---------- */}
        <div className="mb-6">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка платежа</h1>
          <p className="text-gray-600">
            К сожалению, ваш платеж не был завершен.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">Заказ: #{orderId}</p>
          )}
        </div>

        {/* ---------- Info Cards ---------- */}
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="font-medium text-red-800 mb-2 flex items-center">
              <AlertTriangle size={18} className="mr-2" />
              Возможные причины
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Недостаточно средств на карте</li>
              <li>• Карта отклонена банком</li>
              <li>• Ошибка при соединении с платежной системой</li>
              <li>• Превышен лимит по карте</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h3 className="font-medium text-blue-800 mb-2">Ваш заказ сохранен</h3>
            <p className="text-sm text-blue-700">
              Вы можете повторить попытку оплаты или выбрать другой способ оплаты в разделе оформления заказа.
            </p>
          </div>
        </div>

        {/* ---------- Actions ---------- */}
        <div className="space-y-3">
          <button
            onClick={() => {
              toast('Попробуйте оплатить заказ повторно 💳', { icon: '💳' });
              navigate('/checkout');
            }}
            className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center"
          >
            <RefreshCw size={20} className="mr-2" />
            Повторить оплату
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            Вернуться назад
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors flex items-center justify-center"
          >
            <Home size={16} className="mr-2" />
            На главную
          </button>
        </div>

        {/* ---------- Contact ---------- */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Нужна помощь?</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="tel:+992905339595"
              className="flex items-center justify-center bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-sm"
            >
              📞 Позвонить
            </a>
            <a
              href="mailto:support@sakina.tj"
              className="flex items-center justify-center bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
            >
              ✉️ Написать
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
