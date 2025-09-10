// src/lib/blogApi.ts
import { supabase } from './supabaseClient';

/**
 * Minimal types. If you already have these in `types.ts`,
 * feel free to import from there instead.
 */
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: string | null;
  category_id?: string | null;
  author_id?: string | null; // if you use it
  status: BlogStatus;
  is_featured?: boolean | null;
  published_at?: string | null;
  reading_time?: number | null;
  view_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;

  // hydrated fields (added by API)
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

/* ----------------------------- helpers/utils ----------------------------- */

const isMissingTable = (err: any) =>
  err && (err.code === '42P01' || err.message?.includes('does not exist'));

/** Simple slugify, safe for Cyrillic & spaces */
export function generateSlug(input: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
    ы: 'y', э: 'e', ю: 'yu', я: 'ya', ъ: '', ь: ''
  };

  const translit = input
    .toLowerCase()
    .split('')
    .map(ch => map[ch] ?? ch)
    .join('');

  return translit
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** ~200 words/min */
export function calculateReadingTime(content: string): number {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ------------------------------- categories ------------------------------ */

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (err: any) {
    if (isMissingTable(err)) {
      console.warn('[blogApi] blog_categories missing, returning empty list');
      return [];
    }
    console.error('[blogApi] getBlogCategories error:', err);
    throw err;
  }
}

/* ---------------------------------- tags --------------------------------- */

export async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (err: any) {
    if (isMissingTable(err)) {
      console.warn('[blogApi] blog_tags missing, returning empty list');
      return [];
    }
    console.error('[blogApi] getBlogTags error:', err);
    throw err;
  }
}

/* ---------------------------------- posts -------------------------------- */

type GetBlogPostsParams = {
  status?: BlogStatus;            // default: 'published'
  limit?: number;                 // optional
  categorySlug?: string;          // optional - filter by category slug
  tagSlug?: string;               // optional
  search?: string;                // optional (title/excerpt/content)
  featuredOnly?: boolean;         // optional
};

        {/* Article Header */}
        <header className="mb-8">
          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: post.category.color || '#3B82F6' }}
              >
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            {post.published_at && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(post.published_at)}
              </div>
            )}
            {post.reading_time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {post.reading_time} мин чтения
              </div>
            )}
            <button
              onClick={handleShare}
              className="flex items-center hover:text-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </button>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {post.content ? (
            <div
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-gray-600">Содержание статьи недоступно.</p>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие статьи</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                >
                  {relatedPost.featured_image && (
                    <img
                      src={relatedPost.featured_image}
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {relatedPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {relatedPost.published_at && (
                        <span>{formatDate(relatedPost.published_at)}</span>
                      )}
                      {relatedPost.reading_time && (
                        <span>{relatedPost.reading_time} мин</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

    // 4) Fetch tags per post via junction table, then hydrate
    const postIds = posts.map(p => p.id);
    const { data: postTags, error: ptErr } = await supabase
      .from('blog_post_tags')
      .select('post_id, tag_id')
      .in('post_id', postIds);
    if (ptErr) throw ptErr;

    const tagIds = Array.from(new Set((postTags ?? []).map(pt => pt.tag_id)));
    let tagsMap = new Map<string, BlogTag>();
            name,
            slug,
            color
          )
        `)
        .eq('slug', postSlug)
        .eq('status', 'published')
        .single();
    if (tagIds.length) {
      const { data: tags, error: tagsErr } = await supabase
        .from('blog_tags')
        .select('*')
        .in('id', tagIds);
      if (tagsErr) throw tagsErr;
      (tags ?? []).forEach(t => tagsMap.set(t.id, t));
    }

    // 5) Hydrate each post
    const hydrated: BlogPost[] = posts.map(p => {
      const tagsForPost = (postTags ?? [])
        .filter(pt => pt.post_id === p.id)
        .map(pt => tagsMap.get(pt.tag_id))
        .filter(Boolean) as BlogTag[];

      return {
        ...p,
        category: p.category_id ? categoriesMap.get(p.category_id) ?? null : null,
        tags: tagsForPost,
      };
    });
      if (postError) {
        if (postError.code === 'PGRST116') {
          setError('Blog post not found');
        } else {
          throw postError;
        }
        return;
      }
    // 6) Optional client-side filters
      // Fetch tags for this post
      const { data: tagData } = await supabase
        .from('blog_post_tags')
        .select(`
          blog_tags (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('post_id', postData.id);
    if (categorySlug) {
      const tags = tagData?.map(item => item.blog_tags).filter(Boolean) || [];
      const q = search.toLowerCase();
      const fullPost: BlogPost = {
        ...postData,
        category: postData.blog_categories,
        tags: tags
      };
    }
      setPost(fullPost);
    }
      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: (postData.view_count || 0) + 1 })
        .eq('id', postData.id);
/**
      // Fetch related posts from the same category
      if (postData.category_id) {
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image,
            published_at,
            reading_time,
            blog_categories (
              name,
              color
            )
          `)
          .eq('status', 'published')
          .eq('category_id', postData.category_id)
          .neq('id', postData.id)
          .limit(3);
 */
        setRelatedPosts(relatedData || []);
      }
    } catch (err: any) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    if (post.category_id) {
      const { data: cat } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('id', post.category_id)
        .maybeSingle();
      result.category = cat ?? null;
    }

    // Tags
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
      .from('blog_post_tags')
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
        .select('*')
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Blog post not found'}
          </h1>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </button>
        </div>
      </div>
    );
    }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к блогу
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full aspect-[10/9] object-cover rounded-lg"
            />
          </div>
        )}

export default blogApi;
