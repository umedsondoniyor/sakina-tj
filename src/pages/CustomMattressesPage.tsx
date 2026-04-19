import SEO from '../components/SEO';
import { useSiteContact } from '../contexts/SiteContactContext';

export default function CustomMattressesPage() {
  const { phone_href, phone_display } = useSiteContact();

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Матрасы на заказ по индивидуальным размерам в Душанбе"
        description="Изготовим матрас на заказ по вашим размерам в Душанбе. Индивидуальные параметры, подбор жесткости и доставка."
        canonicalPath="/custom-mattresses"
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Матрасы на заказ по индивидуальным размерам в Душанбе
        </h1>
        <p className="text-gray-700 text-lg mb-4">
          Если вам нужен матрас нестандартного размера, команда Sakina изготовит его по индивидуальным параметрам.
          Мы подберем конструкцию, высоту, жесткость и материалы под ваши задачи и размер кровати.
        </p>
        <p className="text-gray-700 mb-8">
          Оставьте заявку и получите консультацию по срокам изготовления и стоимости в течение рабочего дня.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Как заказать</h2>
          <ul className="space-y-2 text-gray-700">
            <li>1. Сообщите точные размеры матраса (ширина, длина, высота).</li>
            <li>2. Выберите уровень жесткости и предпочтительные материалы.</li>
            <li>3. Подтвердите заказ и удобный способ доставки по Душанбе.</li>
          </ul>
          <a
            href={phone_href}
            className="inline-block mt-6 bg-brand-turquoise text-white px-6 py-3 rounded-lg hover:bg-brand-navy transition-colors font-medium"
          >
            Позвонить: {phone_display}
          </a>
        </div>
      </div>
    </div>
  );
}
