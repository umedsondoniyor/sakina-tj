import React from 'react';

interface BlogSidePostProps {
  post: {
    id: string;
    title: string;
    description: string;
    image: string;
  };
}

const BlogSidePost: React.FC<BlogSidePostProps> = ({ post }) => {
  return (
    <div className="flex space-x-4 group cursor-pointer">
      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div>
        <h3 className="font-medium text-sm md:text-base mb-2 group-hover:text-teal-600 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">{post.description}</p>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">
          Читать
        </button>
      </div>
    </div>
  );
};

export default BlogSidePost;