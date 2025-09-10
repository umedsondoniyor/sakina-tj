import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Tag, Search } from 'lucide-react';
import { getBlogPosts, getBlogCategories, getBlogTags } from '../lib/blogApi';
import type { BlogPost, BlogCategory, BlogTag } from '../lib/types';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80';

const useDebounced = (val: string, delay = 350) => {
  const [v, setV] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setV(val), delay);
    return () => clearTimeout(t);
  }, [val, delay]);
  return v;
};

const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);

  // URL → state
  const initialSearch = searchParams.get('search') ?? '';
  const initialCategory = searchParams.get('category') ?? ''; // id or slug or ""
  const initialTag = searchParams.get('tag') ?? ''; // id or slug or ""

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);

  // debounced search for smoother UX
  const debouncedSearch = useDebounced(searchQuery);

  // helpers to resolve id/slug param to an ID your API expects
  const categoryId = useMemo(() => {
    if (!selectedCategory) return undefined;
    const byId = categories.find(c => c.id === selectedCategory)?.id;
    if (byId) return byId;
    const bySlug = categories.find(c => c.slug === selectedCategory)?.id;
    return bySlug || selectedCategory; // fall back to whatever you pass
  }, [selectedCategory, categories]);

  const tagId = useMemo(() => {
    if (!selectedTag) return undefined;
    const byId = tags.find(t => t.id === selectedTag)?.id;
    if (byId) return byId;
    const bySlug = tags.find(t => t.slug === selectedTag)?.id;
    return bySlug || selectedTag;
  }, [selectedTag, tags]);

  // load lists (categories/tags) once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, tgs] = await Promise.all([getBlogCategories(), getBlogTags()]);
        if (!mounted) return;
        setCategories(cats);
        setTags(tgs);
      } catch (e) {
        console.error('Failed loading taxonomies', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // load posts whenever filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getBlogPosts({
          status: 'published',
          categoryId,
          tagId,
          search: debouncedSearch || undefined,
          limit: 24,
        });
        if (!mounted) return;
        setPosts(data);
      } catch (e) {
        console.error('Error loading blog data:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [categoryId, tagId, debouncedSearch]);

  // keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('search', searchQuery); else params.delete('search');
    if (selectedCategory) params.set('category', selectedCategory); else params.delete('category');
    if (selectedTag) params.set('tag', selectedTag); else params.delete('tag');
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePostClick = (post: BlogPost) => navigate(`/blog/${post.slug}`);

  const shownPosts = useMemo(() => {
    // Backend already filtered by category/tag/search; keep an extra client-side guard for search
    if (!debouncedSearch) return posts;
    const q = debouncedSearch.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt ?? '').toLowerCase().includes(q) ||
      (p.content ?? '').toLowerCase().includes(q)
    );
  }, [posts, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
            Блог <span className="text-teal-600">Sleep Club</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Экспертные советы, исследования и рекомендации для здорового сна
          </p>
        </div>

        {/* Search & filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="max-w-xl mx-auto mb-5"
            role="search"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по статьям…"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Поиск по статьям"
              />
            </div>
          </form>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-full text-sm border transition
                ${!selectedCategory ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              `}
            >
              Все категории
            </button>
            {categories.map((c) => {
              const active = selectedCategory === c.id || selectedCategory === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(active ? '' : (c.slug || c.id))}
                  className={`px-3 py-1.5 rounded-full text-sm border transition
                    ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                  style={{
                    backgroundColor: active ? (c.color || '#14b8a6') : '#ffffff',
                    borderColor: active ? (c.color || '#14b8a6') : '#e5e7eb',
                  }}
                  aria-pressed={active}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Tag chips */}
          {!!tags.length && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {tags.slice(0, 10).map((t) => {
                const active = selectedTag === t.id || selectedTag === t.slug;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTag(active ? '' : (t.slug || t.id))}
                    className={`px-2.5 py-1 rounded-full text-xs border inline-flex items-center gap-1 transition
                      ${active ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}
                    `}
                    style={{
                      backgroundColor: active ? (t.color || '#64748b') : '#ffffff',
                      borderColor: active ? (t.color || '#64748b') : '#e5e7eb',
                    }}
                    aria-pressed={active}
                  >
                    <Tag className="w-3 h-3" />
                    {t.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="aspect-[16/9] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : shownPosts.length === 0 ? (
          <div className="text-center py-14">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shownPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => handlePostClick(post)}
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <div className="aspect-[16/9]">
                    <img
                      src={post.featured_image || FALLBACK_IMG}
                      loading="lazy"
                      alt={post.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="p-5">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {post.published_at && (
                      <div className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.published_at).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.reading_time || 3} мин
                    </div>
                  </div>

                  {/* Category badge */}
                  {post.category && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mb-2"
                      style={{
                        backgroundColor: `${post.category.color ?? '#14b8a6'}22`,
                        color: post.category.color ?? '#0f766e',
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}

                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {!!post.excerpt && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{post.excerpt}</p>
                  )}

                  {/* Tags */}
                  {!!post.tags?.length && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 3).map((tg) => (
                        <span
                          key={tg.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px]"
                          style={{ backgroundColor: `${tg.color ?? '#64748b'}22`, color: tg.color ?? '#334155' }}
                        >
                          <Tag className="w-3 h-3" />
                          {tg.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-teal-600 font-medium group-hover:text-teal-700">
                    Читать далее →
                  </span>
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
