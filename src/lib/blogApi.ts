// src/lib/blogApi.ts
import { supabase } from './supabaseClient';

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category_id: string | null;
  author_id: string | null;
  status: BlogStatus;
  is_featured: boolean;
  published_at: string | null;
  reading_time: number | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  // hydrated fields
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

const TABLE_NOT_FOUND = '42P01';

async function safeSelect<T>(fn: () => Promise<{ data: T | null; error: any }>, context: string): Promise<T | null> {
  const { data, error } = await fn();
  if (error) {
    if (error.code === TABLE_NOT_FOUND) {
      console.warn(`[blogApi] Table missing during "${context}". Returning null.`);
      return null;
    }
    throw error;
  }
  return data;
}

/** PUBLIC: fetch published posts for the site */
export async function fetchPublishedPosts(limit = 10): Promise<BlogPost[]> {
  // base posts
  const posts = await safeSelect<BlogPost[]>(() =>
    supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit),
    'fetchPublishedPosts:posts'
  ) ?? [];

  if (posts.length === 0) return [];

  // categories
  const categoryIds = [...new Set(posts.map(p => p.category_id).filter(Boolean))] as string[];
  const categories = categoryIds.length
    ? await safeSelect<BlogCategory[]>(() =>
        supabase.from('blog_categories').select('*').in('id', categoryIds),
        'fetchPublishedPosts:categories'
      )
    : null;

  // post-tag rows
  const postIds = posts.map(p => p.id);
  const postTags = await safeSelect<{ post_id: string; tag_id: string }[]>(() =>
    supabase
      .from('blog_post_tags')
      .select('post_id, tag_id')
      .in('post_id', postIds),
    'fetchPublishedPosts:post_tags'
  ) ?? [];

  const tagIds = [...new Set(postTags.map(pt => pt.tag_id))];
  const tags = tagIds.length
    ? await safeSelect<BlogTag[]>(() =>
        supabase.from('blog_tags').select('*').in('id', tagIds),
        'fetchPublishedPosts:tags'
      )
    : null;

  const categoryMap = new Map((categories ?? []).map(c => [c.id, c]));
  const tagMap = new Map((tags ?? []).map(t => [t.id, t]));

  // attach related
  const tagBucket = new Map<string, BlogTag[]>();
  for (const pt of postTags) {
    if (!tagBucket.has(pt.post_id)) tagBucket.set(pt.post_id, []);
    const tag = tagMap.get(pt.tag_id);
    if (tag) tagBucket.get(pt.post_id)!.push(tag);
  }

  return posts.map(p => ({
    ...p,
    category: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
    tags: tagBucket.get(p.id) ?? []
  }));
}

/** PUBLIC: fetch one post by slug (published only) */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await safeSelect<BlogPost>(() =>
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .maybeSingle(),
    'fetchPostBySlug:post'
  );
  if (!post) return null;

  const [category, postTags] = await Promise.all([
    post.category_id
      ? safeSelect<BlogCategory>(() =>
          supabase.from('blog_categories').select('*').eq('id', post.category_id!).maybeSingle(),
          'fetchPostBySlug:category'
        )
      : Promise.resolve(null),
    safeSelect<{ tag_id: string }[]>(() =>
      supabase.from('blog_post_tags').select('tag_id').eq('post_id', post.id),
      'fetchPostBySlug:post_tags'
    )
  ]);

  const tagIds = (postTags ?? []).map(t => t.tag_id);
  const tags = tagIds.length
    ? await safeSelect<BlogTag[]>(() =>
        supabase.from('blog_tags').select('*').in('id', tagIds),
        'fetchPostBySlug:tags'
      )
    : [];

  return { ...post, category, tags: tags ?? [] };
}

/** ADMIN: list posts (any status) */
export async function adminListPosts(): Promise<BlogPost[]> {
  const data = await safeSelect<BlogPost[]>(() =>
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
    'adminListPosts'
  );
  return data ?? [];
}

/** ADMIN: upsert post */
export async function adminUpsertPost(payload: Partial<BlogPost> & { id?: string }): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as BlogPost;
}

/** ADMIN: delete post */
export async function adminDeletePost(id: string): Promise<void> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

/** ADMIN: categories */
export async function adminListCategories(): Promise<BlogCategory[]> {
  const data = await safeSelect<BlogCategory[]>(() =>
    supabase.from('blog_categories').select('*').order('name'),
    'adminListCategories'
  );
  return data ?? [];
}
export async function adminUpsertCategory(payload: Partial<BlogCategory> & { id?: string }) {
  const { data, error } = await supabase.from('blog_categories').upsert(payload).select('*').single();
  if (error) throw error;
  return data as BlogCategory;
}
export async function adminDeleteCategory(id: string) {
  const { error } = await supabase.from('blog_categories').delete().eq('id', id);
  if (error) throw error;
}

/** ADMIN: tags */
export async function adminListTags(): Promise<BlogTag[]> {
  const data = await safeSelect<BlogTag[]>(() =>
    supabase.from('blog_tags').select('*').order('name'),
    'adminListTags'
  );
  return data ?? [];
}
export async function adminUpsertTag(payload: Partial<BlogTag> & { id?: string }) {
  const { data, error } = await supabase.from('blog_tags').upsert(payload).select('*').single();
  if (error) throw error;
  return data as BlogTag;
}
export async function adminDeleteTag(id: string) {
  const { error } = await supabase.from('blog_tags').delete().eq('id', id);
  if (error) throw error;
}

/** ADMIN: attach/detach tags for a post */
export async function adminSetPostTags(postId: string, tagIds: string[]) {
  // delete old
  await supabase.from('blog_post_tags').delete().eq('post_id', postId);
  if (tagIds.length === 0) return;
  const rows = tagIds.map(tid => ({ post_id: postId, tag_id: tid }));
  const { error } = await supabase.from('blog_post_tags').insert(rows);
  if (error) throw error;
}
