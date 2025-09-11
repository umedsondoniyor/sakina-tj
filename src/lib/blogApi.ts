// src/lib/blogApi.ts
import { supabase } from './supabaseClient';
import type { BlogPost } from './types';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Read endpoints                               */
/* -------------------------------------------------------------------------- */

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
      console.warn('[blogApi] blog_categories missing, returning []');
      return [];
    }
    console.error('[blogApi] getBlogCategories error:', err);
    throw err;
  }
}

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
      console.warn('[blogApi] blog_tags missing, returning []');
      return [];
    }
    console.error('[blogApi] getBlogTags error:', err);
    throw err;
  }
}

/* ---------------------------------- posts -------------------------------- */

type GetBlogPostsParams = {
  status?: BlogStatus;
  categoryId?: string;       // filter by category
  tagId?: string;            // filter by tag
  search?: string;           // ilike on title/excerpt/content
  limit?: number;
  offset?: number;
};

/**
 * Fetch posts; apply optional category/tag/search filtering;
 * hydrate category + tags manually (no FK joins needed).
 */
export async function getBlogPosts(params: GetBlogPostsParams = {}): Promise<BlogPost[]> {
  const {
    status = 'published',
    categoryId,
    tagId,
    search,
    limit = 24,
    offset = 0,
  } = params;

  try {
    // Base posts
    let postsQuery = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', status)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId) postsQuery = postsQuery.eq('category_id', categoryId);

    // Simple multi-field search
    if (search?.trim()) {
      const s = `%${search.trim()}%`;
      postsQuery = postsQuery.or(`title.ilike.${s},excerpt.ilike.${s},content.ilike.${s}`);
    }

    const { data: posts, error: postsErr } = await postsQuery;
    if (postsErr) throw postsErr;
    if (!posts || posts.length === 0) return [];

    // Tag filter (if requested) – filter down to posts that have that tag
    let filtered = posts;
    if (tagId) {
      const { data: linkRows, error: linkErr } = await supabase
        .from('blog_post_tags')
        .select('post_id')
        .eq('tag_id', tagId);
      if (linkErr) throw linkErr;

      const allowed = new Set((linkRows ?? []).map(r => r.post_id));
      filtered = posts.filter(p => allowed.has(p.id));
      if (filtered.length === 0) return [];
    }

    // Hydrate categories
    const categoryIds = Array.from(
      new Set(filtered.map(p => p.category_id).filter(Boolean) as string[])
    );
    let categoryById = new Map<string, BlogCategory>();
    if (categoryIds.length) {
      const { data: categories } = await supabase
        .from('blog_categories')
        .select('*')
        .in('id', categoryIds);
      categoryById = new Map((categories ?? []).map(c => [c.id, c]));
    }

    // Hydrate tags
    const postIds = filtered.map(p => p.id);
    let tagsByPostId = new Map<string, BlogTag[]>();

    if (postIds.length) {
      const { data: postTagLinks } = await supabase
        .from('blog_post_tags')
        .select('post_id, tag_id')
        .in('post_id', postIds);

      const tagIds = Array.from(new Set((postTagLinks ?? []).map(pt => pt.tag_id)));
      let tagById = new Map<string, BlogTag>();

      if (tagIds.length) {
        const { data: tags } = await supabase
          .from('blog_tags')
          .select('*')
          .in('id', tagIds);
        tagById = new Map((tags ?? []).map(t => [t.id, t]));
      }

      tagsByPostId = new Map<string, BlogTag[]>();
      (postTagLinks ?? []).forEach(pt => {
        const existing = tagsByPostId.get(pt.post_id) ?? [];
        const tag = tagById.get(pt.tag_id);
        if (tag) existing.push(tag);
        tagsByPostId.set(pt.post_id, existing);
      });
    }

    // Final shape with hydrated fields
    return filtered.map(p => ({
      ...p,
      category: p.category_id ? (categoryById.get(p.category_id) ?? null) : null,
      tags: tagsByPostId.get(p.id) ?? [],
    })) as BlogPost[];
  } catch (err: any) {
    if (isMissingTable(err)) {
      console.warn('[blogApi] blog tables missing, returning []');
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
      console.warn('[blogApi] blog tables missing, returning null');
      return null;
    }
    console.error('[blogApi] getBlogPost error:', err);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                              Convenience export                            */
/* -------------------------------------------------------------------------- */

export const blogApi = {
  getBlogPosts,
  getBlogPost,
  getBlogCategories,
  getBlogTags,
  generateSlug,
  calculateReadingTime,
};

export default blogApi;
  