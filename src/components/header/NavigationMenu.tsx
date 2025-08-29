import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Sofa,
  RockingChair,
  Earth,
  Users,
} from 'lucide-react';
import { getNavigationItems } from '../../lib/api';
import type { NavigationItem } from '../../lib/types';

// Icon mapping for Lucide icons
const iconMap = {
  BedDouble,
  Sofa,
  RockingChair,
  Earth,
  Users,
};

const NavigationMenu = () => {
  const navigate = useNavigate();
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNavigationItems();
  }, []);

  const loadNavigationItems = async () => {
    try {
      const items = await getNavigationItems();
      setNavigationItems(items);
    } catch (error) {
      console.error('Error loading navigation items:', error);
      // Fallback to default items if API fails
      setNavigationItems([
        {
          id: '1',
          title: 'Матрасы',
          category_slug: 'mattresses',
          icon_name: 'BedDouble',
          order_index: 1,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        {
          id: '2',
          title: 'Кровать',
          category_slug: 'beds',
          icon_name: 'Sofa',
          order_index: 2,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        {
          id: '3',
          title: 'Массажное кресло',
          category_slug: 'smartchair',
          icon_image_url: '/icons/filledSmartChair.png',
          order_index: 3,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        {
          id: '4',
          title: 'Карта',
          category_slug: 'map',
          icon_name: 'Earth',
          order_index: 4,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        {
          id: '5',
          title: 'О нас',
          category_slug: 'about',
          icon_name: 'Users',
          order_index: 5,
          is_active: true,
          created_at: '',
          updated_at: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: NavigationItem, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (item.category_slug === 'about') {
      navigate('/about');
    } else {
      // Navigate to products page with specific category selected
      navigate('/products', { 
        state: { 
          selectedCategories: [item.category_slug],
          clearOtherFilters: true 
        } 
      });
    }
  };

  const renderIcon = (item: NavigationItem) => {
    if (item.icon_image_url) {
      return (
        <img
          src={item.icon_image_url}
          alt={item.title}
          className="w-8 h-8 text-brand-turquoise"
        />
      );
    } else if (item.icon_name && iconMap[item.icon_name as keyof typeof iconMap]) {
      const IconComponent = iconMap[item.icon_name as keyof typeof iconMap];
      return <IconComponent size={32} className="text-brand-turquoise mr-2" />;
    } else {
      // Fallback icon
      return <BedDouble size={32} className="text-brand-turquoise mr-2" />;
    }
  };

  if (loading) {
    return (
      <nav className="mt-4">
        <div className="animate-pulse">
          <div className="flex justify-between w-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="mt-4">
      <ul className="flex justify-between w-full">
        {navigationItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-brand-turquoise transition-colors"
            onClick={(e) => handleItemClick(item, e)}
          >
            {renderIcon(item)}
            {item.title}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationMenu;