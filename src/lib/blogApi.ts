// src/lib/blogApi.ts
import { supabase } from './supabaseClient';

import type { BlogPost } from './types';


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

// Keep only this ONE function in blogApi.ts
type GetBlogPostsParams = {
  status?: 'draft' | 'published' | 'archived';
  categoryId?: string;
  tagId?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function getBlogPosts(params: GetBlogPostsParams = {}): Promise<BlogPost[]> {
  const {
    status = 'published',
    categoryId,
    tagId,
    search,
    limit = 24,
    offset = 0,
  } = params;

  // Base posts
  let postsQuery = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', status)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categoryId) postsQuery = postsQuery.eq('category_id', categoryId);

  // Simple search
  if (search?.trim()) {
    const s = `%${search.trim()}%`;
    postsQuery = postsQuery.or(`title.ilike.${s},excerpt.ilike.${s},content.ilike.${s}`);
  }

  const { data: posts, error: postsErr } = await postsQuery;
  if (postsErr) throw postsErr;
  if (!posts || posts.length === 0) return [];

  // Tag filter (client-side if requested)
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
  const categoryIds = Array.from(new Set(filtered.map(p => p.category_id).filter(Boolean)));
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .in('id', categoryIds.length ? categoryIds : ['00000000-0000-0000-0000-000000000000']); // safe no-op

  const categoryById = new Map((categories ?? []).map(c => [c.id, c]));

  // Hydrate tags
  const postIds = filtered.map(p => p.id);
  const { data: postTagLinks } = await supabase
    .from('blog_post_tags')
    .select('post_id, tag_id')
    .in('post_id', postIds);
  const tagIds = Array.from(new Set((postTagLinks ?? []).map(pt => pt.tag_id)));
  const { data: tags } = await supabase
    .from('blog_tags')
    .select('*')
    .in('id', tagIds.length ? tagIds : ['00000000-0000-0000-0000-000000000000']);
  const tagById = new Map((tags ?? []).map(t => [t.id, t]));

  const tagsByPostId = new Map<string, any[]>();
  (postTagLinks ?? []).forEach(pt => {
    const arr = tagsByPostId.get(pt.post_id) ?? [];
    const tag = tagById.get(pt.tag_id);
    if (tag) arr.push(tag);
    tagsByPostId.set(pt.post_id, arr);
  });

  // Final shape
  return filtered.map(p => ({
    ...p,
    category: p.category_id ? categoryById.get(p.category_id) : null,
    tags: tagsByPostId.get(p.id) ?? [],
  })) as BlogPost[];
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
