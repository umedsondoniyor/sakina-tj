import React from 'react';
import { CheckCircle, Package, Truck, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Helmet>
        <title>Подтверждение заказа | Sakina.tj</title>
        <meta
          name="description"
          content="Ваш заказ успешно оформлен. Спасибо, что выбрали Sakina.tj! Мы свяжемся с вами для подтверждения деталей."
        />
        <meta property="og:title" content="Подтверждение заказа | Sakina.tj" />
        <meta
          property="og:description"
          content="Ваш заказ успешно оформлен. Sakina — эксперт в мире качественного сна."
        />
      </Helmet>
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Заказ успешно оформлен!
          </h1>
          <p className="text-gray-600">
            Номер заказа: <span className="font-semibold">#{orderNumber}</span>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Package className="text-teal-600 mr-3" size={20} />
              <span className="text-sm">Статус заказа</span>
            </div>
            <span className="text-sm font-medium text-teal-600">Обрабатывается</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Truck className="text-teal-600 mr-3" size={20} />
              <span className="text-sm">Ожидаемая доставка</span>
            </div>
            <span className="text-sm font-medium">{estimatedDelivery}</span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <p className="text-sm text-gray-600">
            Мы отправили подтверждение заказа на вашу электронную почту.
          </p>
          <p className="text-sm text-gray-600">
            Наш менеджер свяжется с вами в течение 30 минут для подтверждения деталей заказа.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
          >
            Продолжить покупки
          </button>
          
          <div className="flex space-x-3">
            <a
              href="tel:+992905339595"
              className="flex-1 flex items-center justify-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone size={16} className="mr-2" />
              <span className="text-sm">Позвонить</span>
            </a>
            <a
              href="mailto:support@sakina.tj"
              className="flex-1 flex items-center justify-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail size={16} className="mr-2" />
              <span className="text-sm">Написать</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;