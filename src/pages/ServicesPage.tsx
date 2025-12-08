import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import { Package, Truck, Headphones, Shield, Clock, Star } from 'lucide-react';

interface ServicesSettings {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
}

const ServicesPage: React.FC = () => {
  const [settings, setSettings] = useState<ServicesSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('services_settings')
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
            title: 'Наши услуги',
            description: 'Мы предлагаем широкий спектр услуг для вашего комфорта',
            content: 'Наша компания предоставляет качественные услуги по подбору и доставке товаров для сна.'
          });
        }
      } catch (error) {
        console.error('Error fetching services settings:', error);
        setSettings({
          id: 'default',
          title: 'Наши услуги',
          description: 'Мы предлагаем широкий спектр услуг для вашего комфорта',
          content: 'Наша компания предоставляет качественные услуги по подбору и доставке товаров для сна.'
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

  const services = [
    {
      icon: Package,
      title: 'Подбор товаров',
      description: 'Поможем выбрать идеальный матрас, кровать или аксессуары для здорового сна'
    },
    {
      icon: Truck,
      title: 'Доставка',
      description: 'Быстрая и надежная доставка по всему Душанбе. Также доступен самовывоз'
    },
    {
      icon: Headphones,
      title: 'Консультация',
      description: 'Профессиональные консультации по выбору товаров для сна'
    },
    {
      icon: Shield,
      title: 'Гарантия качества',
      description: 'Все товары имеют гарантию качества и сертификаты соответствия'
    },
    {
      icon: Clock,
      title: 'Быстрое обслуживание',
      description: 'Обработка заказов в течение 24 часов, доставка 1-3 рабочих дня'
    },
    {
      icon: Star,
      title: 'Индивидуальный подход',
      description: 'Учитываем ваши предпочтения и особенности для подбора идеального решения'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{settings?.title || 'Наши услуги'} | Sakina.tj</title>
        <meta name="description" content={settings?.description || 'Услуги компании Sakina'} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {settings?.title || 'Наши услуги'}
            </h1>
            {settings?.description && (
              <p className="text-xl text-teal-50">
                {settings.description}
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {settings?.content && (
            <div className="prose prose-lg max-w-none mb-12">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: settings.content }}
              />
            </div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Готовы начать?
            </h2>
            <p className="text-gray-600 mb-6">
              Свяжитесь с нами для получения дополнительной информации о наших услугах
            </p>
            <a
              href="tel:+992905339595"
              className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;

