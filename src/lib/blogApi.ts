import { supabase } from './supabaseClient';
import type { BlogPost, BlogCategory, BlogTag } from './types';

// Blog Posts API
export async function getBlogPosts(options?: {
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  categoryId?: string;
  limit?: number;
  offset?: number;
}): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:user_profiles(id, full_name, email),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `);

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.featured !== undefined) {
    query = query.eq('is_featured', options.featured);
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  query = query.order('published_at', { ascending: false, nullsFirst: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, (options.offset + (options?.limit || 10)) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform the data to flatten tags
  return (data || []).map(post => ({
    ...post,
    tags: post.tags?.map((pt: any) => pt.tag).filter(Boolean) || []
  }));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:user_profiles(id, full_name, email),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Increment view count
  await supabase
    .from('blog_posts')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);

  return {
    ...data,
    tags: data.tags?.map((pt: any) => pt.tag).filter(Boolean) || []
  };
}

export async function createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([{
      ...post,
      slug: post.slug || generateSlug(post.title || ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Blog Categories API
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createBlogCategory(category: Partial<BlogCategory>): Promise<BlogCategory> {
  const { data, error } = await supabase
    .from('blog_categories')
    .insert([{
      ...category,
      slug: category.slug || generateSlug(category.name || ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBlogCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory> {
  const { data, error } = await supabase
    .from('blog_categories')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlogCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Blog Tags API
export async function getBlogTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createBlogTag(tag: Partial<BlogTag>): Promise<BlogTag> {
  const { data, error } = await supabase
    .from('blog_tags')
    .insert([{
      ...tag,
      slug: tag.slug || generateSlug(tag.name || ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBlogTag(id: string, updates: Partial<BlogTag>): Promise<BlogTag> {
  const { data, error } = await supabase
    .from('blog_tags')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlogTag(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Post Tags Management
export async function updatePostTags(postId: string, tagIds: string[]): Promise<void> {
  // Remove existing tags
  await supabase
    .from('blog_post_tags')
    .delete()
    .eq('post_id', postId);

  // Add new tags
  if (tagIds.length > 0) {
    const { error } = await supabase
      .from('blog_post_tags')
      .insert(
        tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId,
          created_at: new Date().toISOString()
        }))
      );

    if (error) throw error;
  }
}

// Utility functions
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}