import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import { Truck, CreditCard, MapPin, Clock, Shield, Phone } from 'lucide-react';

interface DeliveryPaymentSettings {
  id: string;
  title: string;
  description: string | null;
  delivery_content: string | null;
  payment_content: string | null;
}

const DeliveryPaymentPage: React.FC = () => {
  const [settings, setSettings] = useState<DeliveryPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_payment_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setSettings(data);
        } else {
          // Fallback
          setSettings({
            id: 'default',
            title: 'Доставка и оплата',
            description: 'Удобные способы доставки и оплаты',
            delivery_content: 'Мы осуществляем доставку по всему Душанбе. Срок доставки: 1-3 рабочих дня.',
            payment_content: 'Принимаем оплату наличными при получении или онлайн через Alif Bank.'
          });
        }
      } catch (error) {
        console.error('Error fetching delivery/payment settings:', error);
        setSettings({
          id: 'default',
          title: 'Доставка и оплата',
          description: 'Удобные способы доставки и оплаты',
          delivery_content: 'Мы осуществляем доставку по всему Душанбе. Срок доставки: 1-3 рабочих дня.',
          payment_content: 'Принимаем оплату наличными при получении или онлайн через Alif Bank.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{settings?.title || 'Доставка и оплата'} | Sakina.tj</title>
        <meta name="description" content={settings?.description || 'Информация о доставке и оплате'} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {settings?.title || 'Доставка и оплата'}
            </h1>
            {settings?.description && (
              <p className="text-xl text-blue-50">
                {settings.description}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Delivery Section */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Доставка</h2>
              </div>

              {settings?.delivery_content ? (
                <div 
                  className="text-gray-700 leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: settings.delivery_content }}
                />
              ) : (
                <div className="text-gray-700 leading-relaxed mb-6">
                  <p className="mb-4">
                    Мы осуществляем доставку по всему Душанбе. Срок доставки: 1-3 рабочих дня.
                  </p>
                  <p className="mb-4">
                    Также доступен самовывоз из наших шоурумов.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Доставка по городу</h3>
                    <p className="text-gray-600 text-sm">Доставка по Душанбе в течение 1-3 рабочих дней</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Самовывоз</h3>
                    <p className="text-gray-600 text-sm">Вы можете забрать заказ из наших шоурумов</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                  <CreditCard className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Оплата</h2>
              </div>

              {settings?.payment_content ? (
                <div 
                  className="text-gray-700 leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: settings.payment_content }}
                />
              ) : (
                <div className="text-gray-700 leading-relaxed mb-6">
                  <p className="mb-4">
                    Принимаем оплату наличными при получении или онлайн через Alif Bank.
                  </p>
                  <p>
                    Все платежи защищены и безопасны.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Онлайн оплата</h3>
                    <p className="text-gray-600 text-sm">Безопасная оплата через Alif Bank</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Наличными</h3>
                    <p className="text-gray-600 text-sm">Оплата наличными при получении товара</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-teal-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Вопросы по доставке и оплате?</h3>
            </div>
            <p className="text-center text-gray-600 mb-6">
              Свяжитесь с нами, и мы ответим на все ваши вопросы
            </p>
            <div className="text-center">
              <a
                href="tel:+992905339595"
                className="inline-block bg-brand-turquoise text-white px-6 py-3 rounded-lg hover:bg-brand-navy transition-colors font-medium"
              >
                +992 90 533 9595
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryPaymentPage;

