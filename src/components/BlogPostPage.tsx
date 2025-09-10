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

export async function getBlogPosts(params: GetBlogPostsParams = {}): Promise<BlogPost[]> {
  try {
    const {
      status = 'published',
      limit,
      categorySlug,
      tagSlug,
      search,
      featuredOnly
    } = params;

    // 1) Base query
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', status)
      .order('published_at', { ascending: false });

    // 2) Apply filters
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data: posts, error } = await query;
    if (error) throw error;
    if (!posts || posts.length === 0) return [];

    // 3) Fetch categories
    const categoryIds = Array.from(new Set(posts.map(p => p.category_id).filter(Boolean)));
    let categoriesMap = new Map<string, BlogCategory>();
    if (categoryIds.length) {
      const { data: categories, error: catErr } = await supabase
        .from('blog_categories')
        .select('*')
        .in('id', categoryIds);
      if (catErr) throw catErr;
      (categories ?? []).forEach(c => categoriesMap.set(c.id, c));
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

    // 6) Optional client-side filters
    let filtered = hydrated;
    if (categorySlug) {
      filtered = filtered.filter(p => p.category?.slug === categorySlug);
    }
    if (tagSlug) {
      filtered = filtered.filter(p => p.tags?.some(t => t.slug === tagSlug));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q))
      );
    }

    return filtered;
  } catch (err: any) {
    if (isMissingTable(err)) {
      console.warn('[blogApi] blog_posts missing, returning empty list');
      return [];
    }
    console.error('[blogApi] getBlogPosts error:', err);
    throw err;
  }
}

export async function getBlogPostBySlug(postSlug: string): Promise<BlogPost | null> {
  try {
    // Fetch the post with category
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('slug', postSlug)
      .eq('status', 'published')
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return null;
      } else {
        throw postError;
      }
    }

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

    const tags = tagData?.map(item => item.blog_tags).filter(Boolean) || [];
    const fullPost: BlogPost = {
      ...postData,
      category: postData.blog_categories,
      tags: tags
    };

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (postData.view_count || 0) + 1 })
      .eq('id', postData.id);

    return fullPost;
  } catch (err: any) {
    console.error('[blogApi] getBlogPostBySlug error:', err);
    throw err;
  }
}

const blogApi = {
  getBlogCategories,
  getBlogTags,
  getBlogPosts,
  getBlogPostBySlug,
  generateSlug,
  calculateReadingTime
};

export default blogApi;
