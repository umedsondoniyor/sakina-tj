import React from 'react';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import type { BlogPost } from '../../lib/types';

interface BlogMainPostProps {
  post: BlogPost;
}

const BlogMainPost: React.FC<BlogMainPostProps> = ({ post }) => {
  return (
    <div className="md:col-span-2 group cursor-pointer">
      <div className="aspect-video mb-4 overflow-hidden rounded-lg">
        <img
          src={post.featured_image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Post Meta */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
        {post.published_at && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(post.published_at).toLocaleDateString('ru-RU')}
          </div>
        )}
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {post.reading_time} мин чтения
        </div>
        {post.author?.full_name && (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {post.author.full_name}
          </div>
        )}
      </div>

      {/* Category and Tags */}
      <div className="flex items-center space-x-2 mb-3">
        {post.category && (
          <span
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
          >
            {post.category.name}
          </span>
        )}
        {post.tags?.slice(0, 2).map(tag => (
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

      <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-teal-600">
        {post.title}
      </h3>
      <p className="text-gray-600 text-sm md:text-base mb-4">{post.excerpt}</p>
      <button className="text-teal-600 text-sm md:text-base font-medium hover:text-teal-700">
        Читать
      </button>
    </div>
  );
};

export default BlogMainPost;