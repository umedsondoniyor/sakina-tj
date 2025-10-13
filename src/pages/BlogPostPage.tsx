import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getBlogPostBySlug, getRelatedPosts } from '../lib/blogApi';
import type { BlogPost } from '../lib/types';

/* ---------- Skeleton while loading ---------- */
const BlogPostSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
    <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
    <div className="h-4 w-40 bg-gray-200 rounded mb-8" />
    <div className="h-96 bg-gray-200 rounded mb-8" />
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full" />
      ))}
    </div>
  </div>
);

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Fetch post + related ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slug) {
          setError('Статья не найдена.');
          return;
        }

        const data = await getBlogPostBySlug(slug);
        setPost(data);

        const relatedPosts = await getRelatedPosts(data.id, data.category?.id);
        setRelated(relatedPosts);
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Не удалось загрузить статью. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  /* ---------- Handlers ---------- */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована!');
    }
  };

  /* ---------- Render ---------- */
  if (loading) return <BlogPostSkeleton />;
  if (error || !post)
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{error || 'Статья не найдена'}</h2>
        <p className="text-gray-500 mb-6">Попробуйте вернуться в блог.</p>
        <button
          onClick={() => navigate('/blog')}
          className="px-5 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
        >
          Вернуться к статьям
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- SEO ---------- */}
      <Helmet>
        <title>{`${post.title} | Sleep Club Blog | Sakina.tj`}</title>
        <meta name="description" content={post.excerpt || 'Читайте советы о здоровом сне и комфорте от Sakina.tj'} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.featured_image || '/default-blog.jpg'} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* ---------- Header ---------- */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-teal-600 hover:text-teal-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          {post.published_at && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(post.published_at).toLocaleDateString('ru-RU')}
            </div>
          )}
          {post.reading_time && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {post.reading_time} мин чтения
            </div>
          )}
          <button
            onClick={handleShare}
            className="flex items-center text-gray-500 hover:text-teal-600 transition-colors"
            title="Поделиться"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Поделиться
          </button>
        </div>

        {/* ---------- Cover Image ---------- */}
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full rounded-xl mb-8 shadow-md object-cover"
            loading="lazy"
          />
        )}

        {/* ---------- Body ---------- */}
        <div
          className="prose prose-lg max-w-none text-gray-800 mb-10"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* ---------- Tags ---------- */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${(tag.color || '#0ea5e9')}20`,
                  color: tag.color || '#0ea5e9',
                }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* ---------- Related posts ---------- */}
        {related.length > 0 && (
          <div className="border-t pt-10 mt-10">
            <h2 className="text-2xl font-semibold text-brand-navy mb-6">Похожие статьи</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((r) => (
                <Link
                  to={`/blog/${r.slug}`}
                  key={r.id}
                  className="bg-white rounded-lg shadow hover:shadow-md overflow-hidden transition-shadow"
                >
                  {r.featured_image && (
                    <img
                      src={r.featured_image}
                      alt={r.title}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-2">{r.excerpt}</p>
                    )}
                    {r.published_at && (
                      <p className="text-xs text-gray-400">
                        {new Date(r.published_at).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
