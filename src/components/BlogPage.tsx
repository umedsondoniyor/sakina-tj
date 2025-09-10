import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Tag, Search, Filter } from 'lucide-react';
import { getBlogPosts, getBlogCategories, getBlogTags } from '../lib/blogApi';
import type { BlogPost, BlogCategory, BlogTag } from '../lib/types';

const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedTag]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData, tagsData] = await Promise.all([
        getBlogPosts({ 
          status: 'published',
          categoryId: selectedCategory || undefined,
          limit: 20
        }),
        getBlogCategories(),
        getBlogTags()
      ]);

      setPosts(postsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleTagFilter = (tagId: string) => {
    setSelectedTag(tagId);
    const params = new URLSearchParams(searchParams);
    if (tagId) {
      params.set('tag', tagId);
    } else {
      params.delete('tag');
    }
    setSearchParams(params);
  };

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return post.title.toLowerCase().includes(query) ||
             post.excerpt?.toLowerCase().includes(query) ||
             post.content?.toLowerCase().includes(query);
    }
    return true;
  });

  const handlePostClick = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-navy mb-4">Блог Sleep Club</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Экспертные советы, исследования и рекомендации для здорового сна
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по статьям..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-4 justify-center">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !selectedCategory ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все категории
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id ? category.color : '#f3f4f6'
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 6).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagFilter(selectedTag === tag.id ? '' : tag.id)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors flex items-center ${
                    selectedTag === tag.id ? 'text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedTag === tag.id ? tag.color : '#f3f4f6'
                  }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePostClick(post)}
              >
                <div className="aspect-video">
                  <img
                    src={post.featured_image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  {/* Meta */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    {post.published_at && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.published_at).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.reading_time} мин
                    </div>
                  </div>

                  {/* Category */}
                  {post.category && (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3"
                      style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                  )}

                  <h2 className="text-xl font-bold text-brand-navy mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
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