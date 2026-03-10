import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function BlogGuideBackPainMattressPage() {
  return (
    <article className="min-h-screen bg-white">
      <SEO
        title="Матрас для боли в спине: как выбрать в Душанбе"
        description="Практические рекомендации по выбору матраса при болях в спине: жесткость, высота и поддержка позвоночника."
        canonicalPath="/blog/matras-dlya-boli-v-spine"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-teal-600">Главная</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-teal-600">Блог</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Матрас для боли в спине</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Матрас для боли в спине</h1>
        <p className="text-gray-700 mb-4">
          Этот материал поможет выбрать матрас, который поддерживает позвоночник и снижает нагрузку на поясницу.
          Расширенная версия статьи готовится к публикации.
        </p>
      </div>
    </article>
  );
}
