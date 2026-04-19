// src/components/PaymentCancelPage.tsx
import React, { useEffect, useState } from 'react';
import { XCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useSiteContact } from '../contexts/SiteContactContext';

const PaymentCancelPage: React.FC = () => {
  const { phone_href, email_href } = useSiteContact();
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
        <title>Платеж отменен | Sakina.tj</title>
        <meta
          name="description"
          content="Платеж был отменен. Вы можете попробовать снова или выбрать другой способ оплаты на Sakina.tj."
        />
        <meta property="og:title" content="Платеж отменен | Sakina.tj" />
        <meta
          property="og:description"
          content="Платеж отменен. Попробуйте оплатить снова или выберите другой метод оплаты."
        />
        <meta property="og:image" content="/og-payment-cancel.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* ---------- Header ---------- */}
        <div className="mb-6">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Платеж отменен</h1>
          <p className="text-gray-600">
            Оплата была отменена или произошла ошибка
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">Заказ: #{orderId}</p>
          )}
        </div>

        {/* ---------- Info Cards ---------- */}
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Что произошло?</h3>
            <ul className="text-sm text-yellow-700 space-y-1 text-left">
              <li>• Платеж был отменен пользователем</li>
              <li>• Произошла ошибка при обработке карты</li>
              <li>• Превышено время ожидания</li>
              <li>• Недостаточно средств на карте</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Ваш заказ сохранен</h3>
            <p className="text-sm text-blue-700">
              Товары остались в корзине. Вы можете попробовать оплатить снова
              или выбрать другой способ оплаты.
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
            className="w-full bg-brand-turquoise text-white py-3 rounded-lg hover:bg-brand-navy transition-colors flex items-center justify-center"
          >
            <RefreshCw size={20} className="mr-2" />
            Попробовать снова
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
              href={phone_href}
              className="flex items-center justify-center bg-brand-turquoise text-white px-4 py-2 rounded-lg hover:bg-brand-navy text-sm"
            >
              📞 Позвонить
            </a>
            <a
              href={email_href}
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

export default PaymentCancelPage;
