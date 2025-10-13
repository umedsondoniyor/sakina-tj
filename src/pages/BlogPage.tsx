// src/pages/BlogPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Tag, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getBlogPosts, getBlogCategories, getBlogTags } from '../lib/blogApi';
import type { BlogPost, BlogCategory, BlogTag } from '../lib/types';

/* ------------------ Main Component ------------------ */
const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL-driven state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(searchParams.get('category') || '');
  const [selectedTagSlug, setSelectedTagSlug] = useState(searchParams.get('tag') || '');

  // Data
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Helpers ---------- */
  const categoryBySlug = useMemo(() => {
    const map = new Map<string, BlogCategory>();
    categories.forEach(c => map.set(c.slug, c));
    return map;
  }, [categories]);

  const tagBySlug = useMemo(() => {
    const map = new Map<string, BlogTag>();
    tags.forEach(t => map.set(t.slug, t));
    return map;
  }, [tags]);

  /* ---------- Load categories & tags ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cats, tgs] = await Promise.all([getBlogCategories(), getBlogTags()]);
        setCategories(cats);
        setTags(tgs);
      } catch (e) {
        console.error('Error loading taxonomy:', e);
        setError('Не удалось загрузить категории и теги.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- 👇 NEW: Sync with URL changes ---------- */
  useEffect(() => {
    setSelectedCategorySlug(searchParams.get('category') || '');
    setSelectedTagSlug(searchParams.get('tag') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  /* ---------- Debounce search ---------- */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      setSearchParams(params);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  /* ---------- Load posts when filters change ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryId = selectedCategorySlug
          ? categoryBySlug.get(selectedCategorySlug)?.id
          : undefined;

        const tagId = selectedTagSlug
          ? tagBySlug.get(selectedTagSlug)?.id
          : undefined;

        const data = await getBlogPosts({
          status: 'published',
          categoryId,
          tagId,
          search: searchQuery || undefined,
          limit: 24,
        });

        setPosts(data);
      } catch (e) {
        console.error('Error loading posts:', e);
        setError('Не удалось загрузить статьи. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    })(); 
  }, [
    selectedCategorySlug,
    selectedTagSlug,
    searchQuery,
    categoryBySlug,
    tagBySlug,
    searchParams,
  ]); 

