import React from 'react';

interface BlogMainPostProps {
  post: {
    id: string;
    title: string;
    description: string;
    image: string;
  };
}

const BlogMainPost: React.FC<BlogMainPostProps> = ({ post }) => {
  return (
    <div className="md:col-span-2 group cursor-pointer">
      <div className="aspect-video object-cover mb-4">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-[36rem] object-cover rounded-lg"
        />
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-teal-600">
        {post.title}
      </h3>
      <p className="text-gray-600 text-sm md:text-base mb-4">{post.description}</p>
      <button className="text-teal-600 text-sm md:text-base font-medium hover:text-teal-700">
        Читать
      </button>
    </div>
  );
};

export default BlogMainPost;