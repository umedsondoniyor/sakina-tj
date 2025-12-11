import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Phone, ArrowRight, Home } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { OneClickOrder } from '../lib/types';
import { formatCurrency } from '../lib/utils';

const OneClickConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OneClickOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('one_click_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Заказ не найден</h2>
          <p className="mt-2 text-gray-600">Заказ с указанным ID не существует.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-brand-turquoise text-white hover:bg-brand-navy"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const orderNumber = `ИМ-${order.id.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-teal-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Спасибо!
          </h1>
          <div className="flex items-center justify-center text-teal-600 mb-4">
            <CheckCircle size={20} className="mr-2" />
            <span className="font-medium">
              Ваш заказ {orderNumber} успешно оформлен.
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Мы свяжемся с вами в ближайшее время.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <div className="space-y-3">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Номер вашего заказа:</div>
                <div className="text-sm text-gray-600">{orderNumber}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Ваш телефон:</div>
                <div className="text-sm text-gray-600">{order.phone_number}</div>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="font-medium text-gray-900 mb-2">Товар:</div>
              <div className="text-sm text-gray-600">{order.product_name}</div>
              {order.selected_size && (
                <div className="text-sm text-gray-600">Размер: {order.selected_size}</div>
              )}
              <div className="text-lg font-bold text-teal-600 mt-2">
                {formatCurrency(order.product_price)}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            Сотрудники Sakina не запрашивают СМС-коды при подтверждении 
            доставки или другую конфиденциальную информацию по телефону 
            или другими способами. При любых подозрениях свяжитесь с нашей 
            горячей линией: <strong>8 800 600-99-12</strong>. 
            <a href="#" className="text-teal-600 hover:text-teal-700 underline">Подробнее</a>
          </p>
        </div>

        {/* Additional Info */}
        <div className="text-left space-y-3 mb-6">
          <p className="text-sm text-gray-600">
            Подробная информация о заказе появится в{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 underline">
              личном кабинете
            </a>{' '}
            после звонка менеджера. Вы всегда можете связаться с нами 
            по бесплатному номеру телефона{' '}
            <strong className="text-gray-900">"8 800 600-99-12"</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-brand-turquoise text-white hover:bg-brand-navy transition-colors flex items-center justify-center"
          >
            Продолжить покупки
            <ArrowRight size={20} className="ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home size={20} className="mr-2" />
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};

export default OneClickConfirmationPage;