import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Home } from 'lucide-react';
import PaymentStatusChecker from './PaymentStatusChecker';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderCleared, setOrderCleared] = useState(false);

  // Get order ID from URL params or session storage
  const orderId = searchParams.get('order_id') || sessionStorage.getItem('sakina_order_id');
  const paymentId = searchParams.get('payment_id') || sessionStorage.getItem('sakina_payment_id');

  useEffect(() => {
    if (!orderId) {
      toast.error('Информация о заказе не найдена');
      navigate('/');
      return;
    }

    // Clear session storage
    sessionStorage.removeItem('sakina_order_id');
    sessionStorage.removeItem('sakina_payment_id');
  }, [orderId, navigate]);

  const handleStatusChange = (status: string) => {
    if (status === 'completed' && !orderCleared) {
      // Clear cart only when payment is confirmed as completed
      clearCart();
      setOrderCleared(true);
      toast.success('Платеж успешно завершен!');
    } else if (status === 'failed' || status === 'cancelled') {
      toast.error('Платеж не был завершен');
    }
  };

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Спасибо за заказ!
            </h1>
            <p className="text-gray-600">
              Ваш заказ принят и обрабатывается
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Статус платежа</h2>
              <PaymentStatusChecker
                orderId={orderId}
                onStatusChange={handleStatusChange}
                autoRefresh={true}
                refreshInterval={5000}
              />
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Информация о заказе</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Номер заказа:</span>
                  <span className="font-medium">#{orderId}</span>
                </div>
                {paymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID платежа:</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Дата создания:</span>
                  <span>{new Date().toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Что дальше?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Подтверждение оплаты</h3>
                    <p className="text-sm text-gray-600">
                      Мы проверим статус вашего платежа и подтвердим заказ
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Обработка заказа</h3>
                    <p className="text-sm text-gray-600">
                      Наш менеджер свяжется с вами для уточнения деталей доставки
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Доставка</h3>
                    <p className="text-sm text-gray-600">
                      Мы доставим ваш заказ в указанное время и место
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Нужна помощь?</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Package size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Служба поддержки</h3>
                    <p className="text-sm text-gray-600">+992 90 533 9595</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Home size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email поддержка</h3>
                    <p className="text-sm text-gray-600">support@sakina.tj</p>
                  </div>
                </div>
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

export default PaymentSuccessPage;