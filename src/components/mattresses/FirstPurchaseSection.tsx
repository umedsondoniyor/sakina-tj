import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Article {
  id: string;
  title: string;
  description: string;
  image_url: string;
  article_url: string | null;
  is_main: boolean;
}

interface FirstPurchaseSectionProps {
  sectionTitle?: string;
}

const FirstPurchaseSection = ({ sectionTitle = 'Первая покупка' }: FirstPurchaseSectionProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('mattress_first_purchase_articles')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error loading articles:', error);
          return;
        }

        if (data) {
          setArticles(data as Article[]);
          console.log('Loaded articles:', data.length);
        } else {
          console.warn('No articles data returned');
        }
      } catch (e) {
        console.error('Error loading articles:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  const mainArticle = articles.find(a => a.is_main) || articles[0];
  const otherArticles = articles.filter(a => a.id !== mainArticle.id);

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <img
            src={mainArticle.image_url}
            alt={mainArticle.title}
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/600x400/e5e7eb/9ca3af?text=Article';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="font-bold text-lg mb-2">{mainArticle.title}</h3>
            <p className="text-sm opacity-90 mb-4">{mainArticle.description}</p>
            {mainArticle.article_url && (
              <a
                href={mainArticle.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:text-teal-200 transition-colors"
              >
              Читать
              </a>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {otherArticles.map((article) => (
            <div key={article.id} className="flex space-x-4 group cursor-pointer">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/96x96/e5e7eb/9ca3af?text=Article';
                }}
              />
              <div>
                <h3 className="font-medium mb-2 group-hover:text-teal-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                {article.article_url && (
                  <a
                    href={article.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 text-sm hover:text-teal-700 transition-colors"
                  >
                  Читать
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FirstPurchaseSection;