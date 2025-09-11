import React from 'react';
import { Clock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BlogPost } from '../../lib/types';

interface BlogSidePostProps {
  post: BlogPost;
}

const BlogSidePost: React.FC<BlogSidePostProps> = ({ post }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${post.slug}`);
  };

  return (
    <div className="flex space-x-4 group cursor-pointer" onClick={handleClick}>
      <div className="w-24 h-64 md:w-36 md:h-64 flex-shrink-0">
        <img
          src={post.featured_image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80'}
          alt={post.title}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div>
        {/* Post Meta */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
          {post.category && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
            >
              {post.category.name}
            </span>
          )}
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {post.reading_time} мин
          </div>
        </div>
        
        <h3 className="font-medium text-sm md:text-base mb-2 group-hover:text-teal-600 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            {post.tags.slice(0, 2).map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                <Tag className="w-2.5 h-2.5 mr-0.5" />
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">
          Читать
        </button>
      </div>
    </div>
  );
};

export default BlogSidePost;