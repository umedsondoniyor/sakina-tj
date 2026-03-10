import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <SEO
        title="Страница не найдена | Sakina.tj"
        description="Запрошенная страница не найдена."
        canonicalPath="/404"
        robots="noindex, nofollow"
      />
      <div className="max-w-lg w-full text-center bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">404</h1>
        <p className="text-gray-600 mb-6">Страница не найдена или была удалена.</p>
        <Link
          to="/"
          className="inline-block bg-brand-turquoise text-white px-6 py-3 rounded-lg hover:bg-brand-navy transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
