import { Helmet } from 'react-helmet-async';
import ContactSection from '../components/ContactSection';
import StructuredData from '../components/StructuredData';
import { toAbsoluteUrl } from '../lib/seo';

export default function ContactsPage() {
  const businessName = 'Sakina';
  const addressLabel = 'Душанбе, Пулоди 4';
  const phoneLabel = '+992 90 533 9595';
  const phoneHref = '+992905339595';
  const openingHoursLabel = 'Ежедневно: 09:00-20:00';
  const canonicalPath = '/contacts';

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: businessName,
    url: toAbsoluteUrl(canonicalPath),
    telephone: phoneHref,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Пулоди 4',
      addressLocality: 'Душанбе',
      addressCountry: 'TJ',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '20:00',
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Контакты | Sakina.tj</title>
        <meta
          name="description"
          content="Контакты шоурума Sakina в Душанбе: адрес, телефон, график работы и карта проезда."
        />
        <link rel="canonical" href={toAbsoluteUrl(canonicalPath)} />
      </Helmet>
      <StructuredData data={localBusinessSchema} />

      <section className="bg-white py-10 md:py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Шоурум Sakina в Душанбе</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Контактные данные (NAP)</h2>
              <div className="space-y-3 text-gray-700">
                <p><span className="font-semibold">Название:</span> {businessName}</p>
                <p><span className="font-semibold">Адрес:</span> {addressLabel}</p>
                <p>
                  <span className="font-semibold">Телефон:</span>{' '}
                  <a className="text-brand-turquoise hover:text-brand-navy" href={`tel:${phoneHref}`}>
                    {phoneLabel}
                  </a>
                </p>
                <p><span className="font-semibold">График:</span> {openingHoursLabel}</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 min-h-[320px]">
              <iframe
                title="Карта шоурума Sakina в Душанбе"
                src="https://www.google.com/maps?q=%D0%94%D1%83%D1%88%D0%B0%D0%BD%D0%B1%D0%B5,+%D0%9F%D1%83%D0%BB%D0%BE%D0%B4%D0%B8+4&output=embed"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
