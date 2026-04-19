import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../lib/blogApi';
import type { BlogPost } from '../lib/types';
import BlogMainPost from './blog/BlogMainPost';
import BlogSidePost from './blog/BlogSidePost';

interface SleepClubBlogProps {
  initialPosts?: BlogPost[];
}

const SleepClubBlog: React.FC<SleepClubBlogProps> = ({ initialPosts = [] }) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPosts.length > 0) {
      return;
    }
    loadBlogPosts();
  }, [initialPosts.length]);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const data = await getBlogPosts({ 
        status: 'published', 
        limit: 4 
      });
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError('Failed to load blog posts');
      // Fallback to static content
      setPosts([
        {
          id: '1',
          title: 'Влияние здорового сна на организм',
          slug: 'healthy-sleep-impact',
          excerpt: '😴 Здоровый сон - это один из важнейших факторов здоровья нашего организма.',
          featured_image: 'https://ik.imagekit.io/3js0rb3pk/cover.png?updatedAt=1744149464470',
          status: 'published',
          is_featured: true,
          reading_time: 5,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Последствия нарушения сна',
          slug: 'sleep-disorders-consequences',
          excerpt: 'Хотим обсудить с вами очень важную тему - последствия нарушения сна.',
          featured_image: 'https://ik.imagekit.io/3js0rb3pk/cover1.png?updatedAt=1744149464740',
          status: 'published',
          is_featured: false,
          reading_time: 4,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Как спать и высыпаться?',
          slug: 'how-to-sleep-well',
          excerpt: 'Привет, друзья! Сегодня мы хотим поделиться с вами советом от специалиста',
          featured_image: 'https://ik.imagekit.io/3js0rb3pk/cover2.png?updatedAt=1744149464181',
          status: 'published',
          is_featured: false,
          reading_time: 6,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Матрас – залог вашего крепкого и здорового сна',
          slug: 'mattress-healthy-sleep',
          excerpt: 'Качество сна напрямую влияет на наше здоровье, настроение и продуктивность.',
          featured_image: 'https://ik.imagekit.io/3js0rb3pk/cover3.png?updatedAt=1744149462628',
          status: 'published',
          is_featured: false,
          reading_time: 7,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section
        aria-labelledby="sleepclub-blog-title"
        className="max-w-7xl mx-auto px-4 py-8 md:py-12"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="md:hidden -mx-4 overflow-x-hidden px-4">
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shrink-0 w-[calc(100vw-2rem)] max-w-md">
                    <div className="flex space-x-4">
                      <div className="w-32 h-56 bg-gray-200 rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2 pt-1">
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && posts.length === 0) {
    return (
      <section
        aria-labelledby="sleepclub-blog-title"
        className="max-w-7xl mx-auto px-4 py-8 md:py-12"
      >
        <h2 id="sleepclub-blog-title" className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
          Блог Sleep Club
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Не удалось загрузить статьи блога</p>
          <button
            onClick={loadBlogPosts}
            className="px-4 py-2 bg-brand-turquoise text-white rounded hover:bg-brand-navy"
          >
            Попробовать снова
          </button>
        </div>
      </section>
    );
  }

  // Find featured post or use first post
  const featuredPost = posts.find(p => p.is_featured) || posts[0];
  const sidePosts = posts.filter(p => p.id !== featuredPost?.id).slice(0, 3);

  return (
    <section
      aria-labelledby="sleepclub-blog-title"
      className="max-w-7xl mx-auto px-4 py-8 md:py-12"
    >
      <h2 id="sleepclub-blog-title" className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
        Блог Sleep Club
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Main Featured Post */}
        <div className="md:col-span-2">
          {featuredPost && <BlogMainPost post={featuredPost} />}
        </div>

        {/* Side posts: horizontal swipe on mobile, column on md+ */}
        <div>
          <div
            className="md:hidden -mx-4 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory px-4 pb-1"
            role="region"
            aria-roledescription="carousel"
            aria-label="Статьи блога"
          >
            <div className="flex gap-4">
              {sidePosts.map((post) => (
                <div
                  key={post.id}
                  className="snap-start shrink-0 w-[calc(100vw-2rem)] max-w-md"
                >
                  <BlogSidePost post={post} />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block space-y-6">
            {sidePosts.map((post) => (
              <BlogSidePost key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>

      {posts.length > 4 && (
        <div className="text-center mt-8">
          <a
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors"
          >
            Все статьи блога
          </a>
        </div>
      )}
    </section>
  );
};

export default SleepClubBlog;