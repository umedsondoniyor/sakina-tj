import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, Eye } from 'lucide-react';
import { getBlogPost, getBlogPosts } from '../lib/blogApi';
import type { BlogPost } from '../lib/types';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const postData = await getBlogPost(slug!);
      
      if (!postData) {
        setError('Post not found');
        return;
      }
      
      setPost(postData);

      // Load related posts from same category
      if (postData.category_id) {
        const related = await getBlogPosts({
          status: 'published',
          categoryId: postData.category_id,
          limit: 3
        });
        setRelatedPosts(related.filter(p => p.id !== postData.id));
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error === 'Post not found' ? 'Статья не найдена' : 'Ошибка загрузки'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error === 'Post not found' 
              ? 'Запрашиваемая статья не существует или была удалена'
              : 'Не удалось загрузить статью'
            }
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
          >
            Вернуться к блогу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center text-gray-600 hover:text-teal-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к блогу
        </button>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow overflow-hidden">
          {post.featured_image && (
            <div className="aspect-[10/9]">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              {post.published_at && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.published_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {post.reading_time} мин чтения
              </div>
              {post.author?.full_name && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author.full_name}
                </div>
              )}
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.view_count} просмотров
              </div>
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {post.category && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                >
                  {post.category.name}
                </span>
              )}
              {post.tags?.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 italic border-l-4 border-teal-500 pl-4">
                {post.excerpt}
              </p>
            )}

            {/* Content */}
            <div className="prose prose-lg prose-gray max-w-none mb-8">
              <div className="whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Share Button */}
            <div className="flex items-center justify-between pt-8 border-t">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </button>
              </div>
              
              {post.author?.full_name && (
                <div className="text-sm text-gray-600">
                  Автор: <span className="font-medium">{post.author.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Похожие статьи</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <article
                  key={relatedPost.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                >
                  <div className="aspect-[14/9]">
                    <img
                      src={relatedPost.featured_image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80'}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-brand-navy mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {relatedPost.reading_time} мин
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;