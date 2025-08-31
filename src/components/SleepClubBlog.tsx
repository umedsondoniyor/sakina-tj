import React, { useMemo } from 'react';
import BlogMainPost from './blog/BlogMainPost';
import BlogSidePost from './blog/BlogSidePost';

interface BlogPost {
  id: number;
  title: string;
  description: string;
  image: string;
  isMain?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Влияние здорового сна на организм',
    description: '😴 Здоровый сон - это один из важнейших факторов здоровья нашего организма. ',
    image: 'https://ik.imagekit.io/3js0rb3pk/cover.png?updatedAt=1744149464470',
    isMain: true
  },
  {
    id: 2,
    title: 'Последствия нарушения сна',
    description: 'Хотим обсудить с вами очень важную тему - последствия нарушения сна.',
    image: 'https://ik.imagekit.io/3js0rb3pk/cover1.png?updatedAt=1744149464740'
  },
  {
    id: 3,
    title: 'Как спать и высыпаться?',
    description: 'Привет, друзья! Сегодня мы хотим поделиться с вами советом от специалиста',
    image: 'https://ik.imagekit.io/3js0rb3pk/cover2.png?updatedAt=1744149464181'
  },
  {
    id: 4,
    title: 'Матрас – залог вашего крепкого и здорового сна',
    description: 'Качество сна напрямую влияет на наше здоровье, настроение и продуктивность.',
    image: 'https://ik.imagekit.io/3js0rb3pk/cover3.png?updatedAt=1744149462628'
  }
];

const SleepClubBlog: React.FC = () => {
  // Single-pass split with a safe fallback
  const { main, sides } = useMemo(() => {
    let mainPost = blogPosts.find(p => p.isMain) ?? blogPosts[0];
    const sidePosts = blogPosts.filter(p => p.id !== mainPost?.id);
    return { main: mainPost, sides: sidePosts };
  }, []);

  return (
    <section
      aria-labelledby="sleepclub-blog-title"
      className="max-w-7xl mx-auto px-4 py-8 md:py-12"
    >
      <h2 id="sleepclub-blog-title" className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
        Блог Sleep Club
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Main Featured Post */}
        <div className="md:col-span-2">
          {main && <BlogMainPost post={main} />}
        </div>

        {/* Side Posts */}
        <div className="space-y-6">
          {sides.map(post => (
            <BlogSidePost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SleepClubBlog;
