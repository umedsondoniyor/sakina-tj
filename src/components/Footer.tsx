import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getCategories } from '../lib/api';
import { getBlogPosts } from '../lib/blogApi';
import type { BlogPost } from '../lib/types';
import FooterSection from './footer/FooterSection';
import MobileFooterAccordion from './footer/MobileFooterAccordion';
import SocialMediaSection from './footer/SocialMediaSection';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const RU_CATEGORY_NAMES: Record<string, string> = {
  mattresses: 'Матрасы',
  beds: 'Кровати',
  pillows: 'Подушки',
  blankets: 'Одеяла',
  sofas: 'Диваны и кресла',
  covers: 'Чехлы',
  kids: 'Для детей',
  furniture: 'Мебель',
  smartchair: 'Массажные кресла',
  map: 'Карты',
};

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Get categories from database
        const cats = await getCategories();
        
        // Also get product categories to ensure we show all
        const { data: products } = await supabase
          .from('products')
          .select('category');
        
        const categorySet = new Set<string>();
        (products || []).forEach((p: any) => {
          if (p.category) categorySet.add(p.category);
        });

        // Combine database categories with product categories
        const allCategories: Category[] = [];
        
        // Add categories from database
        cats.forEach((cat: any) => {
          const slug = cat.slug || cat.name?.toLowerCase() || '';
          if (slug) {
            allCategories.push({
              id: cat.id,
              name: cat.name || RU_CATEGORY_NAMES[slug] || slug,
              slug,
            });
          }
        });

        // Add missing categories from products
        categorySet.forEach((slug) => {
          if (!allCategories.find(c => c.slug === slug)) {
            allCategories.push({
              id: slug,
              name: RU_CATEGORY_NAMES[slug] || slug,
              slug,
            });
          }
        });

        // Sort and limit to main categories
        const mainCategories = ['mattresses', 'beds', 'pillows', 'blankets', 'sofas', 'smartchair'];
        const sorted = allCategories
          .filter(c => mainCategories.includes(c.slug) || categorySet.has(c.slug))
          .sort((a, b) => {
            const aIndex = mainCategories.indexOf(a.slug);
            const bIndex = mainCategories.indexOf(b.slug);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.name.localeCompare(b.name, 'ru');
          })
          .slice(0, 6); // Limit to 6 categories

        setCategories(sorted);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories
        setCategories([
          { id: 'mattresses', name: 'Матрасы', slug: 'mattresses' },
          { id: 'beds', name: 'Кровати', slug: 'beds' },
          { id: 'pillows', name: 'Подушки', slug: 'pillows' },
          { id: 'blankets', name: 'Одеяла', slug: 'blankets' },
        ]);
      }
    };

    loadCategories();
  }, []);

  // Load blog posts
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const posts = await getBlogPosts({ status: 'published', limit: 6 });
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      }
    };

    loadBlogPosts();
  }, []);

  // Build footer links dynamically
  const footerLinks = {
    catalog: {
      title: 'Каталог',
      links: categories.map(cat => ({
        label: cat.name,
        href: cat.slug === 'mattresses' ? '/mattresses' : `/products?category=${cat.slug}`,
      })),
    },
    company: {
      title: 'О компании',
      links: [
        { label: 'О нас', href: '/about' },
      ],
    },
    blog: {
      title: 'Блог',
      links: blogPosts.length > 0
        ? [
            { label: 'Все статьи', href: '/blog' },
            ...blogPosts.slice(0, 5).map((post) => ({
              label: post.title,
              href: `/blog/${post.slug}`,
            })),
          ]
        : [
            { label: 'Все статьи', href: '/blog' },
          ],
    },
    info: {
      title: 'Информация',
      links: [
        { label: 'Доставка и оплата', href: '/about#delivery' },
        { label: 'Гарантия', href: '/about#warranty' },
        { label: 'Возврат товара', href: '/about#returns' },
      ],
    },
    contacts: {
      title: 'Контакты',
      links: [
        { label: 'Контакты', href: '/about#contacts' },
        { label: 'Адреса магазинов', href: '/about#locations' },
      ],
    },
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Footer */}
        <MobileFooterAccordion footerLinks={footerLinks} />

        {/* Desktop Footer Links */}
        <div className="hidden md:grid md:grid-cols-5 gap-8 mb-12">
          {Object.entries(footerLinks).map(([key, section]) => (
            <FooterSection
              key={key}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>

        {/* Contact Information */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Phone */}
            <div className="flex items-start space-x-3">
              <Phone className="text-teal-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-white mb-1">Телефон</p>
                <a
                  href="tel:+992905339595"
                  className="text-sm hover:text-teal-400 transition-colors"
                >
                  +992 90 533 95 95
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-3">
              <Mail className="text-teal-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-white mb-1">Email</p>
                <a
                  href="mailto:info@sakina.tj"
                  className="text-sm hover:text-teal-400 transition-colors"
                >
                  info@sakina.tj
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-3">
              <MapPin className="text-teal-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-white mb-1">Адрес</p>
                <p className="text-sm">
                  Душанбе, Пулоди 4
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
            {/* Social Media & Copyright */}
            <div className="space-y-4">
              <SocialMediaSection />
              <div className="text-sm text-gray-400">
                <p>© {currentYear} Компания «Sakina»</p>
                <p className="mt-1">Все права защищены</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col items-center md:items-end space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Принимаем к оплате:</span>
                <div className="flex items-center space-x-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                    alt="Visa"
                    className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                    alt="Mastercard"
                    className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center md:text-right">
                <p>ИП "Sakina"</p>
                <p>ИНН: указать при наличии</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
