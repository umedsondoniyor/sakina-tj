import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import StructuredData from '../components/StructuredData';
import { toAbsoluteUrl } from '../lib/seo';
import type { FaqPageLoaderData } from '../loaders/publicLoaders';

export default function FaqPage() {
  const { faqItems } = useLoaderData() as FaqPageLoaderData;
  const canonicalPath = '/faq';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <title>Частые вопросы (FAQ) | Sakina.tj</title>
        <meta
          name="description"
          content="Ответы на популярные вопросы о заказах, доставке, гарантии и оплате в Sakina — матрасы и товары для сна в Душанбе."
        />
        <link rel="canonical" href={toAbsoluteUrl(canonicalPath)} />
      </Helmet>
      {faqItems.length > 0 ? <StructuredData data={faqSchema} /> : null}

      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">Частые вопросы</h1>
          <p className="text-gray-600 mb-8 md:mb-10">
            Собрали ответы на типичные вопросы покупателей. Если не нашли нужное — напишите или позвоните нам.
          </p>

          {faqItems.length === 0 ? (
            <p className="text-gray-600 text-center py-12">Пока нет добавленных вопросов. Загляните позже.</p>
          ) : (
            <ul className="space-y-3 list-none p-0 m-0">
              {faqItems.map((item) => (
                <li key={item.id}>
                  <details className="border border-gray-200 rounded-xl bg-gray-50/80 open:bg-white open:shadow-sm transition-shadow [&[open]_summary_svg]:rotate-180">
                    <summary className="cursor-pointer list-none font-semibold text-brand-navy px-5 py-4 pr-10 relative [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform shrink-0"
                        aria-hidden
                      />
                    </summary>
                    <div className="px-5 pb-4 pt-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100">
                      {item.answer}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
