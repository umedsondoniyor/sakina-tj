import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowLeft, User, Eye, Facebook, Twitter, Copy, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { getBlogPost, getRelatedPosts } from '../lib/blogApi';
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
  const [related, setRelated] = useState<Partial<BlogPost>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

        const data = await getBlogPost(slug);
        if (!data) {
          setError('Статья не найдена.');
          return;
        }

        setPost(data);

        // Load related posts
        if (data.id) {
          const relatedPosts = await getRelatedPosts(data.id, data.category?.id);
          setRelated(relatedPosts);
        }
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Не удалось загрузить статью. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  /* ---------- Share handlers ---------- */
  const handleShare = async (platform?: 'facebook' | 'twitter') => {
    if (!post) return;

    const url = window.location.href;
    const title = post.title;
    const text = post.excerpt || '';

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Ссылка скопирована в буфер обмена!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Не удалось скопировать ссылку');
      }
    }
  };

  /* ---------- Render ---------- */
  if (loading) return <BlogPostSkeleton />;
  
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">{error || 'Статья не найдена'}</h2>
          <p className="text-gray-500 mb-6">Попробуйте вернуться в блог.</p>
          <button
            onClick={() => navigate('/blog')}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
          >
            Вернуться к статьям
          </button>
        </div>
      </div>
    );
  }

  const publishedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

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
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* ---------- Breadcrumbs ---------- */}
        <nav className="mb-6 text-sm">
          <div className="flex items-center space-x-2 text-gray-500">
            <Link to="/" className="hover:text-teal-600 transition-colors">Главная</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-teal-600 transition-colors">Блог</Link>
            {post.category && (
              <>
                <span>/</span>
                <span className="text-gray-700">{post.category.name}</span>
              </>
            )}
          </div>
        </nav>

        {/* ---------- Back Button ---------- */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center text-teal-600 hover:text-teal-700 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к статьям
        </button>

        {/* ---------- Header ---------- */}
        <header className="mb-8">
          {/* Category Badge */}
          {post.category && (
            <Link
              to={`/blog?category=${post.category.slug}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 transition-colors hover:opacity-80"
              style={{
                backgroundColor: `${post.category.color || '#14b8a6'}20`,
                color: post.category.color || '#14b8a6',
              }}
            >
              {post.category.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            {publishedDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-teal-600" />
                <span>{publishedDate}</span>
              </div>
            )}
            {post.reading_time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-teal-600" />
                <span>{post.reading_time} мин чтения</span>
              </div>
            )}
            {post.view_count > 0 && (
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-teal-600" />
                <span>{post.view_count} просмотров</span>
              </div>
            )}
            {post.author?.full_name && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-teal-600" />
                <span>{post.author.full_name}</span>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Поделиться:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Поделиться в Facebook"
                aria-label="Поделиться в Facebook"
              >
                <Facebook size={20} />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                title="Поделиться в Twitter"
                aria-label="Поделиться в Twitter"
              >
                <Twitter size={20} />
              </button>
              <button
                onClick={() => handleShare()}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Скопировать ссылку"
                aria-label="Скопировать ссылку"
              >
                {copied ? <Check size={20} className="text-teal-600" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* ---------- Cover Image ---------- */}
        {post.featured_image && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* ---------- Excerpt ---------- */}
        {post.excerpt && (
          <div className="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-r-lg mb-10">
            <p className="text-lg text-gray-700 leading-relaxed italic">{post.excerpt}</p>
          </div>
        )}

        {/* ---------- Body Content ---------- */}
        <div className="prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:my-2 prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-gray-300 prose-td:p-3 max-w-none mb-12">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              h1: ({ node, ...props }) => <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
              h4: ({ node, ...props }) => <h4 className="text-xl font-semibold text-gray-900 mt-4 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-gray-700 my-1" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-600 my-4" {...props} />
              ),
              code: ({ node, inline, ...props }: any) => {
                if (inline) {
                  return (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
                  );
                }
                return (
                  <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
                );
              },
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse border border-gray-300" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-3 text-gray-700" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="rounded-xl shadow-lg my-8 w-full h-auto" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-teal-600 no-underline hover:underline font-medium" {...props} />
              ),
            }}
          >
            {post.content || ''}
          </ReactMarkdown>
        </div>

        {/* ---------- Tags ---------- */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-12 pt-8 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Теги:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/blog?tag=${tag.slug}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: `${tag.color || '#14b8a6'}15`,
                  color: tag.color || '#14b8a6',
                  border: `1px solid ${tag.color || '#14b8a6'}30`,
                }}
              >
                <Tag className="w-3 h-3 mr-1.5" />
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* ---------- Author Card (if author exists) ---------- */}
        {post.author?.full_name && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-12 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {post.author.full_name}
                </h3>
                {post.author.email && (
                  <p className="text-sm text-gray-600">{post.author.email}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------- Related posts ---------- */}
        {related.length > 0 && (
          <section className="border-t border-gray-200 pt-12 mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Похожие статьи
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((r) => (
                <Link
                  to={`/blog/${r.slug}`}
                  key={r.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 group"
                >
                  {r.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={r.featured_image}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{r.excerpt}</p>
                    )}
                    {r.published_at && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(r.published_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Back to Blog Button ---------- */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium shadow-lg shadow-teal-500/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все статьи блога
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
