import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Tag, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getBlogPosts, getBlogCategories, getBlogTags } from '../lib/blogApi';
import type { BlogPost, BlogCategory, BlogTag } from '../lib/types';

/* ------------------ Main Component ------------------ */
const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL-driven state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(searchParams.get('category') || '');
  const [selectedTagSlug, setSelectedTagSlug] = useState(searchParams.get('tag') || '');

  // Data
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Helpers ---------- */
  const categoryBySlug = useMemo(() => {
    const map = new Map<string, BlogCategory>();
    categories.forEach(c => map.set(c.slug, c));
    return map;
  }, [categories]);

  const tagBySlug = useMemo(() => {
    const map = new Map<string, BlogTag>();
    tags.forEach(t => map.set(t.slug, t));
    return map;
  }, [tags]);

  /* ---------- Load categories & tags ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cats, tgs] = await Promise.all([getBlogCategories(), getBlogTags()]);
        setCategories(cats);
        setTags(tgs);
      } catch (e) {
        console.error('Error loading taxonomy:', e);
        setError('Не удалось загрузить категории и теги.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- 👇 Sync state with URL ---------- */
  useEffect(() => {
    setSelectedCategorySlug(searchParams.get('category') || '');
    setSelectedTagSlug(searchParams.get('tag') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  /* ---------- Debounce search ---------- */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      setSearchParams(params);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  /* ---------- Load posts when filters change ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryId = selectedCategorySlug
          ? categoryBySlug.get(selectedCategorySlug)?.id
          : undefined;

        const tagId = selectedTagSlug
          ? tagBySlug.get(selectedTagSlug)?.id
          : undefined;

        const data = await getBlogPosts({
          status: 'published',
          categoryId,
          tagId,
          search: searchQuery || undefined,
          limit: 24,
        });

        setPosts(data);
      } catch (e) {
        console.error('Error loading posts:', e);
        setError('Не удалось загрузить статьи. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    })();
  }, [
    selectedCategorySlug,
    selectedTagSlug,
    searchQuery,
    categoryBySlug,
    tagBySlug,
    searchParams,
  ]);

  /* ---------- Handlers ---------- */
  const handleCategoryClick = (slugOrEmpty: string) => {
    setSelectedCategorySlug(slugOrEmpty);
    const params = new URLSearchParams(searchParams);
    if (slugOrEmpty) params.set('category', slugOrEmpty);
    else params.delete('category');
    setSearchParams(params);
  };

  const handleTagClick = (slugOrEmpty: string) => {
    setSelectedTagSlug(slugOrEmpty);
    const params = new URLSearchParams(searchParams);
    if (slugOrEmpty) params.set('tag', slugOrEmpty);
    else params.delete('tag');
    setSearchParams(params);
  };

  const handlePostClick = (post: BlogPost) => navigate(`/blog/${post.slug}`);

  /* ---------- UI ---------- */
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Загрузка статей...</p>
      </div>
    );
  }

  const selectedCategoryObj = selectedCategorySlug
    ? categoryBySlug.get(selectedCategorySlug)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Блог Sleep Club — советы о сне и здоровье | Sakina.tj</title>
        <meta
          name="description"
          content="Читайте экспертные статьи и советы от Sleep Club: здоровый сон, подбор матрасов, уход за здоровьем и комфортом."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">Блог Sleep Club</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Экспертные советы, исследования и рекомендации для здорового сна
          </p>
        </div>

        {error && <div className="text-center text-red-500 mb-6">{error}</div>}

        {/* ---------- Search & Filters ---------- */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="relative max-w-xl mx-auto mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по статьям..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryClick('')}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  !selectedCategorySlug
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Все категории
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategorySlug === cat.slug
                      ? 'text-white'
                      : 'text-gray-800 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategorySlug === cat.slug
                        ? cat.color || '#14b8a6'
                        : '#f3f4f6',
                  }}
                  title={cat.description || cat.name}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 6).map((tag) => {
                const active = selectedTagSlug === tag.slug;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(active ? '' : tag.slug)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors flex items-center ${
                      active ? 'text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: active ? tag.color || '#0ea5e9' : '#f3f4f6',
                    }}
                    title={tag.name}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------- Posts ---------- */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">
              Попробуйте изменить параметры поиска или фильтры.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="relative aspect-[16/9] bg-gray-100">
                  <img
                    src={
                      post.featured_image ||
                      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80'
                    }
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    {post.published_at && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.published_at).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                    {post.reading_time && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.reading_time} мин
                      </div>
                    )}
                  </div>

                  {post.category && (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2"
                      style={{
                        backgroundColor: `${(post.category.color || '#14b8a6')}20`,
                        color: post.category.color || '#0f766e',
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}

                  <h3 className="text-lg font-semibold text-brand-navy mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}

                  <button className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
                    Читать далее →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
