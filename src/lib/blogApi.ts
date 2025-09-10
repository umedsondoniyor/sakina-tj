import { supabase } from './supabaseClient';
import type { BlogPost, BlogCategory, BlogTag } from './types';

// Static fallback data
const FALLBACK_POSTS: BlogPost[] = [
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
];

// Blog Posts API
export async function getBlogPosts(options?: {
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  categoryId?: string;
  limit?: number;
  offset?: number;
}): Promise<BlogPost[]> {
  try {
    // Check if blog tables exist by trying a simple query
    const { error: testError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      // Table doesn't exist, return fallback data
      console.warn('Blog tables not found, using fallback data');
      return FALLBACK_POSTS.filter(post => {
        if (options?.status && post.status !== options.status) return false;
        if (options?.featured !== undefined && post.is_featured !== options.featured) return false;
        return true;
      }).slice(0, options?.limit || FALLBACK_POSTS.length);
    }

  // First, fetch all categories and tags for mapping
  const [categoriesResult, tagsResult] = await Promise.all([
    supabase.from('blog_categories').select('*'),
    supabase.from('blog_tags').select('*')
  ]);

  const categories = categoriesResult.data || [];
  const allTags = tagsResult.data || [];

  // Fetch blog posts
  let query = supabase
    .from('blog_posts')
    .select('*');

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

  const { data: posts, error } = await query;

  if (error) throw error;

  if (!posts) return [];

  // Fetch post tags for all posts
  const postIds = posts.map(post => post.id);
  const { data: postTags } = await supabase
    .from('blog_post_tags')
    .select('post_id, tag_id')
    .in('post_id', postIds);

  // Fetch user profiles for authors
  const authorIds = [...new Set(posts.map(post => post.author_id).filter(Boolean))];
  const { data: authors } = await supabase
    .from('user_profiles')
    .select('id, full_name, email')
    .in('id', authorIds);

  // Map the data manually
  return posts.map(post => {
    const category = categories.find(cat => cat.id === post.category_id) || null;
    const author = authors?.find(auth => auth.id === post.author_id) || null;
    const postTagIds = postTags?.filter(pt => pt.post_id === post.id).map(pt => pt.tag_id) || [];
    const tags = allTags.filter(tag => postTagIds.includes(tag.id));

    return {
      ...post,
      category,
      author,
      tags
    };
  });
  } catch (error) {
    console.warn('Error fetching blog posts, using fallback:', error);
    return FALLBACK_POSTS.slice(0, options?.limit || FALLBACK_POSTS.length);
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // Check if blog tables exist
    const { error: testError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      // Table doesn't exist, return fallback data
      return FALLBACK_POSTS.find(post => post.slug === slug) || null;
    }

  // First, fetch all categories and tags for mapping
  const [categoriesResult, tagsResult] = await Promise.all([
    supabase.from('blog_categories').select('*'),
    supabase.from('blog_tags').select('*')
  ]);

  const categories = categoriesResult.data || [];
  const allTags = tagsResult.data || [];

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (!post) return null;

  // Increment view count
  await supabase
    .from('blog_posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', post.id);

  // Fetch post tags
  const { data: postTags } = await supabase
    .from('blog_post_tags')
    .select('tag_id')
    .eq('post_id', post.id);

  // Fetch author
  const { data: author } = post.author_id ? await supabase
    .from('user_profiles')
    .select('id, full_name, email')
    .eq('id', post.author_id)
    .single() : { data: null };

  // Map the data manually
  const category = categories.find(cat => cat.id === post.category_id) || null;
  const postTagIds = postTags?.map(pt => pt.tag_id) || [];
  const tags = allTags.filter(tag => postTagIds.includes(tag.id));

  return {
    ...post,
    category,
    author,
    tags
  };
  } catch (error) {
    console.warn('Error fetching blog post, using fallback:', error);
    return FALLBACK_POSTS.find(post => post.slug === slug) || null;
  }
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
  try {
    const { error: testError } = await supabase
      .from('blog_categories')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') return [];

  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
  } catch (error) {
    console.warn('Error fetching blog categories:', error);
    return [];
  }
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
  try {
    const { error: testError } = await supabase
      .from('blog_tags')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') return [];

  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
  } catch (error) {
    console.warn('Error fetching blog tags:', error);
    return [];
  }
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