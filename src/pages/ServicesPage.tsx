import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import { useSiteContact } from '../contexts/SiteContactContext';
import { getLucideIconByName } from '../lib/navigationIcons';
import type { ServicePageItem, ServicesPageSettings } from '../lib/types';

const FALLBACK_SETTINGS: Omit<ServicesPageSettings, 'id'> & { id?: string } = {
  title: 'Наши услуги',
  description: 'Мы предлагаем широкий спектр услуг для вашего комфорта',
  content:
    'Наша компания предоставляет качественные услуги по подбору и доставке товаров для сна.',
  cta_title: 'Готовы начать?',
  cta_description:
    'Свяжитесь с нами для получения дополнительной информации о наших услугах',
  cta_button_label: 'Связаться с нами',
};

const FALLBACK_ITEMS: Pick<ServicePageItem, 'title' | 'description' | 'icon_name'>[] = [
  {
    icon_name: 'Package',
    title: 'Подбор товаров',
    description:
      'Поможем выбрать идеальный матрас, кровать или аксессуары для здорового сна',
  },
  {
    icon_name: 'Truck',
    title: 'Доставка',
    description: 'Быстрая и надежная доставка по всему Душанбе. Также доступен самовывоз',
  },
  {
    icon_name: 'Headphones',
    title: 'Консультация',
    description: 'Профессиональные консультации по выбору товаров для сна',
  },
  {
    icon_name: 'Shield',
    title: 'Гарантия качества',
    description: 'Все товары имеют гарантию качества и сертификаты соответствия',
  },
  {
    icon_name: 'Clock',
    title: 'Быстрое обслуживание',
    description: 'Обработка заказов в течение 24 часов, доставка 1-3 рабочих дня',
  },
  {
    icon_name: 'Star',
    title: 'Индивидуальный подход',
    description: 'Учитываем ваши предпочтения и особенности для подбора идеального решения',
  },
];

const ServicesPage: React.FC = () => {
  const { phone_href } = useSiteContact();
  const [settings, setSettings] = useState<ServicesPageSettings | null>(null);
  const [items, setItems] = useState<ServicePageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, itemsRes] = await Promise.all([
          supabase.from('services_settings').select('*').limit(1).maybeSingle(),
          supabase
            .from('services_page_items')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true }),
        ]);

        if (settingsRes.error) throw settingsRes.error;

        if (settingsRes.data) {
          setSettings(settingsRes.data as ServicesPageSettings);
        } else {
          setSettings({ id: 'default', ...FALLBACK_SETTINGS } as ServicesPageSettings);
        }

        if (itemsRes.error) {
          console.warn('services_page_items:', itemsRes.error);
          setItems([]);
        } else {
          const rows = (itemsRes.data ?? []) as ServicePageItem[];
          setItems(rows.length > 0 ? rows : []);
        }
      } catch (error) {
        console.error('Error fetching services page:', error);
        setSettings({ id: 'default', ...FALLBACK_SETTINGS } as ServicesPageSettings);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const merged = settings ?? ({ ...FALLBACK_SETTINGS, id: 'default' } as ServicesPageSettings);
  const displayItems =
    items.length > 0
      ? items
      : FALLBACK_ITEMS.map((row, i) => ({
          id: `fallback-${i}`,
          title: row.title,
          description: row.description,
          icon_name: row.icon_name,
          order_index: i,
          is_active: true,
          created_at: '',
          updated_at: '',
        }));

  return (
    <>
      <Helmet>
        <title>{merged.title} | Sakina.tj</title>
        <meta
          name="description"
          content={merged.description || 'Услуги компании Sakina'}
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{merged.title}</h1>
            {merged.description && (
              <p className="text-xl text-teal-50">{merged.description}</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {merged.content && (
            <div className="prose prose-lg max-w-none mb-12">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: merged.content }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {displayItems.map((service) => {
              const Icon = getLucideIconByName(service.icon_name);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {merged.cta_title || FALLBACK_SETTINGS.cta_title}
            </h2>
            <p className="text-gray-600 mb-6">
              {merged.cta_description || FALLBACK_SETTINGS.cta_description}
            </p>
            <a
              href={phone_href}
              className="inline-block bg-brand-turquoise text-white px-6 py-3 rounded-lg hover:bg-brand-navy transition-colors font-medium"
            >
              {merged.cta_button_label || FALLBACK_SETTINGS.cta_button_label}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
