// src/components/BlogPostPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, Eye } from "lucide-react";
import { getBlogPost, getBlogPosts } from "../lib/blogApi";
import type { BlogPost } from "../lib/types";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { Options as RehypeSanitizeOptions } from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// Optional: you can import a light theme if you like (uncomment below and install the style):
// import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const sanitizeSchema: RehypeSanitizeOptions = {
  // Start from the default schema and allow a few blog-friendly extras
  ...rehypeSanitize.defaultSchema,
  tagNames: [
    ...(rehypeSanitize.defaultSchema?.tagNames || []),
    "iframe", "video", "source", "figure", "figcaption"
  ],
  attributes: {
    ...(rehypeSanitize.defaultSchema?.attributes || {}),
    iframe: [
      ["src"], ["allow"], ["allowfullscreen"], ["frameborder"], ["width"], ["height"]
    ],
    video: [["controls"], ["src"], ["poster"], ["width"], ["height"]],
    source: [["src"], ["type"]],
    img: [
      ...(rehypeSanitize.defaultSchema?.attributes?.img || []),
      ["className"], ["loading"], ["decoding"]
    ],
    code: [["className"]],
  },
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize plugins to avoid re-instantiation on each render
  const remarkPlugins = useMemo(() => [remarkGfm], []);
  const rehypePlugins = useMemo(() => [rehypeRaw, [rehypeSanitize, sanitizeSchema]], []);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const postData = await getBlogPost(slug);
        if (!postData) {
          if (!cancelled) setError("Post not found");
          return;
        }
        if (!cancelled) setPost(postData);

        // Load related posts from the same category (excluding current post)
        if (postData.category_id) {
          const related = await getBlogPosts({
            status: "published",
            categoryId: postData.category_id,
            limit: 6,
          });
          const filtered = related.filter((p) => p.id !== postData.id).slice(0, 3);
          if (!cancelled) setRelatedPosts(filtered);
        } else {
          if (!cancelled) setRelatedPosts([]);
        }
      } catch (err) {
        console.error("Error loading post:", err);
        if (!cancelled) setError("Failed to load post");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleShare = async () => {
    const shareData = {
      title: post?.title ?? "Блог Sleep Club",
      text: post?.excerpt ?? "",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        // You could replace with a toast:
        alert("Ссылка скопирована в буфер обмена");
      }
    } catch {
      // user cancelled or clipboard blocked; no-op
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="h-64 bg-gray-200 rounded-lg mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    const notFound = error === "Post not found";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {notFound ? "Статья не найдена" : "Ошибка загрузки"}
          </h2>
          <p className="text-gray-600 mb-6">
            {notFound
              ? "Запрашиваемая статья не существует или была удалена"
              : "Не удалось загрузить статью"}
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
          >
            Вернуться к блогу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/blog")}
          className="flex items-center text-gray-600 hover:text-teal-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к блогу
        </button>

        {/* Article */}
        <article className="bg-white rounded-lg shadow overflow-hidden">
          {post.featured_image && (
            <div className="aspect-[16/9] bg-gray-100">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              {post.published_at && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.published_at).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {post.reading_time || 3} мин чтения
              </div>
              {post.author?.full_name && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author.full_name}
                </div>
              )}
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.view_count ?? 0} просмотров
              </div>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {post.category && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${post.category.color}20`,
                    color: post.category.color,
                  }}
                >
                  {post.category.name}
                </span>
              )}
              {post.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 border-l-4 border-teal-500 pl-4">
                {post.excerpt}
              </p>
            )}

            {/* Content (Markdown) */}
            <div className="prose prose-lg prose-gray max-w-none mb-8">
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins as any}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline) {
                      return (
                        <SyntaxHighlighter
                          // style={oneLight} // <- if you imported a theme above
                          language={match?.[1] || "plaintext"}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ children, ...props }) {
                    return (
                      <a
                        {...props}
                        className="text-teal-600 hover:text-teal-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    );
                  },
                  img(props) {
                    return (
                      <figure className="my-6">
                        <img
                          {...props}
                          className="rounded-lg max-w-full h-auto mx-auto"
                          loading="lazy"
                          decoding="async"
                        />
                        {props.alt && (
                          <figcaption className="text-center text-sm text-gray-500 mt-2">
                            {props.alt}
                          </figcaption>
                        )}
                      </figure>
                    );
                  },
                  iframe(props) {
                    return (
                      <div className="aspect-video w-full rounded-lg overflow-hidden my-6">
                        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                        <iframe {...props} className="w-full h-full" />
                      </div>
                    );
                  },
                }}
              >
                {post.content || ""}
              </ReactMarkdown>
            </div>

            {/* Share */}
            <div className="flex items-center justify-between pt-8 border-t">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </button>

              {post.author?.full_name && (
                <div className="text-sm text-gray-600">
                  Автор: <span className="font-medium">{post.author.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Похожие статьи</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <article
                  key={rp.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${rp.slug}`)}
                >
                  <div className="aspect-[16/10] bg-gray-100">
                    <img
                      src={
                        rp.featured_image ||
                        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={rp.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-brand-navy mb-2 line-clamp-2">
                      {rp.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{rp.excerpt}</p>
                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {rp.reading_time || 3} мин
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
