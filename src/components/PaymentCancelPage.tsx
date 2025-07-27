import React from 'react';
import { XCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Платеж отменен
          </h1>
          <p className="text-gray-600">
            Оплата была отменена или произошла ошибка
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">
              Заказ: #{orderId}
            </p>
          )}
        </div>

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
              Товары остались в корзине. Вы можете попробовать оплатить снова или выбрать другой способ оплаты.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center"
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

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Нужна помощь?</p>
          <div className="flex space-x-4 justify-center">
            <a
              href="tel:+992905339595"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Позвонить
            </a>
            <a
              href="mailto:support@sakina.tj"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Написать
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;