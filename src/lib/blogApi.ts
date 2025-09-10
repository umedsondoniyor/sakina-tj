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
  categorySlug?: string;          // optional
  tagSlug?: string;               // optional
  search?: string;                // optional (title/excerpt/content)
  featuredOnly?: boolean;         // optional
};

/**
 * Fetch posts, then hydrate category + tags manually (no FK joins).
 */
export async function getBlogPosts(params: GetBlogPostsParams = {}): Promise<BlogPost[]> {
  const {
    status = 'published',
    limit,
    categorySlug,
    tagSlug,
    search,
    featuredOnly,
  } = params;

  try {
    // 1) Start with posts by status (and optional featured/limit)
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', status)
      .order('published_at', { ascending: false });

    if (featuredOnly) query = query.eq('is_featured', true);
    if (limit) query = query.limit(limit);

    // We’ll post-filter categorySlug/tagSlug/search in JS after hydrating
    const { data: postsRaw, error: postsErr } = await query;
    if (postsErr) throw postsErr;

    const posts: BlogPost[] = postsRaw ?? [];
    if (posts.length === 0) return [];

    // 2) Collect IDs for hydration
    const categoryIds = Array.from(new Set(posts.map(p => p.category_id).filter(Boolean))) as string[];

    // 3) Fetch categories
    let categoriesMap = new Map<string, BlogCategory>();
    if (categoryIds.length) {
      const { data: cats, error: catsErr } = await supabase
        .from('blog_categories')
        .select('*')
        .in('id', categoryIds);
      if (catsErr) throw catsErr;
      (cats ?? []).forEach(c => categoriesMap.set(c.id, c));
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
        (p.title?.toLowerCase().includes(q)) ||
        (p.excerpt?.toLowerCase().includes(q)) ||
        (p.content?.toLowerCase().includes(q))
      );
    }

    return filtered;
  } catch (err: any) {
    if (isMissingTable(err)) {
      console.warn('[blogApi] blog tables missing, returning empty posts');
      return [];
    }
    console.error('[blogApi] getBlogPosts error:', err);
    throw err;
  }
}

/**
 * Fetch single post by slug and hydrate category + tags.
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!post) return null;

    const result: BlogPost = { ...post, tags: [], category: null };

    // Category
    if (post.category_id) {
      const { data: cat } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('id', post.category_id)
        .maybeSingle();
      result.category = cat ?? null;
    }

    // Tags
    const { data: postTags } = await supabase
      .from('blog_post_tags')
      .select('tag_id')
      .eq('post_id', post.id);

    const tagIds = Array.from(new Set((postTags ?? []).map(pt => pt.tag_id)));
    if (tagIds.length) {
      const { data: tags } = await supabase
        .from('blog_tags')
        .select('*')
        .in('id', tagIds);
      result.tags = tags ?? [];
    }

    return result;
  } catch (err: any) {
    if (isMissingTable(err)) {
      console.warn('[blogApi] blog tables missing, returning null post');
      return null;
    }
    console.error('[blogApi] getBlogPost error:', err);
    throw err;
  }
}

/* --------------------------- optional default obj -------------------------- */

export const blogApi = {
  getBlogPosts,
  getBlogPost,
  getBlogCategories,
  getBlogTags,
  generateSlug,
  calculateReadingTime,
};

export default blogApi;
