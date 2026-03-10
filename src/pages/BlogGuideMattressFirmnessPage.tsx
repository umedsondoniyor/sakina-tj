import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function BlogGuideMattressFirmnessPage() {
  return (
    <article className="min-h-screen bg-white">
      <SEO
        title="Жесткость матраса: какую выбрать в Душанбе"
        description="Разбираем, как подобрать жесткость матраса под вес, привычки сна и состояние спины."
        canonicalPath="/blog/zhestkost-matrasa"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-teal-600">Главная</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-teal-600">Блог</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Жесткость матраса</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Жесткость матраса</h1>
        <p className="text-gray-700 mb-4">
          Краткий гид по выбору жесткости матраса: мягкий, средний или жесткий вариант. Полный разбор скоро появится в блоге.
        </p>
      </div>
    </article>
  );
}
