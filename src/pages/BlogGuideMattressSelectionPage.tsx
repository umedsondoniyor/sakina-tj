import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function BlogGuideMattressSelectionPage() {
  return (
    <article className="min-h-screen bg-white">
      <SEO
        title="Как выбрать матрас: практическое руководство для Душанбе"
        description="Подробный гид по выбору матраса: жесткость, высота, наполнение и размер. Советы перед покупкой в Душанбе."
        canonicalPath="/blog/kak-vybrat-matras"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-teal-600">Главная</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-teal-600">Блог</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Как выбрать матрас</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Как выбрать матрас</h1>
        <p className="text-gray-700 mb-4">
          Это базовый гид, который поможет быстро выбрать подходящий матрас по размерам, жесткости
          и наполнителям. Полная версия материала готовится и будет опубликована в ближайшее время.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Что учесть при выборе</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Размер матраса под вашу кровать (например, 160x200 или 180x200).</li>
            <li>• Жесткость в зависимости от предпочтений и веса.</li>
            <li>• Высота и состав слоев (latex, memory foam, пружинный блок).</li>
            <li>• Наличие индивидуального производства под нестандартные размеры.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
