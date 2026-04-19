import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import StructuredData from '../components/StructuredData';
import { toAbsoluteUrl } from '../lib/seo';

const faqItems: { question: string; answer: string }[] = [
  {
    question: 'Как оформить заказ?',
    answer:
      'Вы можете оформить заказ на сайте через корзину, по телефону +992 90 533 9595 или в шоуруме в Душанбе. Консультант поможет подобрать модель и сроки доставки.',
  },
  {
    question: 'Есть ли доставка по Таджикистану?',
    answer:
      'Да, мы доставляем по Душанбе и регионам. Сроки и стоимость зависят от адреса — уточняйте у менеджера при оформлении заказа.',
  },
  {
    question: 'Какая гарантия на матрасы?',
    answer:
      'На матрасы предоставляется гарантия производителя (обычно до нескольких лет в зависимости от модели). Условия гарантии указаны в карточке товара и в документах при покупке.',
  },
  {
    question: 'Можно ли вернуть или обменять товар?',
    answer:
      'Условия возврата и обмена зависят от состояния товара и сроков. Свяжитесь с нами по телефону или в шоуруме — мы подскажем актуальные правила.',
  },
  {
    question: 'Как подобрать матрас онлайн?',
    answer:
      'На главной странице есть подборщик матрасов по шагам. Также вы можете позвонить консультанту — мы учтём вес, привычки сна и бюджет.',
  },
  {
    question: 'Какие способы оплаты доступны?',
    answer:
      'Доступны оплата при получении и онлайн-оплата (в том числе через банковские сервисы). Точные варианты уточняйте при оформлении заказа.',
  },
  {
    question: 'Где находится шоурум и какой график работы?',
    answer:
      'Шоурум в Душанбе по адресу Пулоди 4. График: ежедневно 09:00–20:00. Подробности и схема проезда — в разделе «Контакты».',
  },
];

export default function FaqPage() {
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
      <StructuredData data={faqSchema} />

      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">Частые вопросы</h1>
          <p className="text-gray-600 mb-8 md:mb-10">
            Собрали ответы на типичные вопросы покупателей. Если не нашли нужное — напишите или позвоните нам.
          </p>

          <ul className="space-y-3 list-none p-0 m-0">
            {faqItems.map((item) => (
              <li key={item.question}>
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
        </div>
      </div>
    </>
  );
}
