import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Bed, BedDouble, Box, Sofa, Pill as Pillow, Shirt, Baby, BookOpen, Table, Twitch as Kitchen, Heart, Coffee, Home, Lamp, Tv, Package, Palmtree, Phone, X } from 'lucide-react';
import Logo from './Logo';
import CategoryMenuItem from './catalog/CategoryMenuItem';
import CategoryContent from './catalog/CategoryContent';

interface MenuItem {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface CatalogMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryContent {
  title: string;
  categories: {
    title: string;
    items: string[];
  }[];
  promos: {
    title: string;
    description: string;
    image: string;
  }[];
}

const menuItems: MenuItem[] = [
  { id: 'mattresses', name: 'Матрасы', icon: Bed },
  { id: 'beds', name: 'Кровати', icon: BedDouble },
  { id: 'sofas', name: 'Диваны и кресла', icon: Sofa },
  { id: 'covers', name: 'Чехлы', icon: Box },
  { id: 'pillows', name: 'Подушки', icon: Pillow },
  { id: 'blankets', name: 'Одеяла', icon: Box },
  { id: 'kids', name: 'Для детей', icon: Baby },
];

const categoryContent: Record<string, CategoryContent> = {
  mattresses: {
    title: 'Матрасы',
    categories: [
      {
        title: 'Все матрасы',
        items: ['Однослойные', 'Двуслойные', 'Комплект матрас + кровать', 'В рулонах', 'Детские']
      },
      {
        title: 'Размер',
        items: ['90×200', '120×200', '140×200', '160×200', '180×200', '200×200']
      },
      {
        title: 'Жесткость',
        items: ['Жесткие', 'Средней жесткости', 'Мягкие', 'Разная жесткость сторон']
      },
      {
        title: 'Вид',
        items: ['Ортопедические', 'Пружинные', 'Беспружинные']
      },
      {
        title: 'Цена',
        items: ['Недорогие матрасы', 'Премиум', 'Матрасы со скидкой']
      },
      {
        title: 'Другие товары',
        items: ['Топперы/наматрасники', 'Защитные чехлы']
      }
    ],
    promos: [
      {
        title: 'Подборщик матрасов',
        description: 'создайте идеальное место для сна',
        image: 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png'
      },
      {
        title: 'Матрас — ключ к вашему сну',
        description: 'доверьте будущий здоровый сон',
        image: 'https://ik.imagekit.io/3js0rb3pk/cover3.png'
      }
    ]
  },
  beds: {
    title: 'Кровати',
    categories: [
      {
        title: 'Все кровати',
        items: ['Двуспальные', 'Односпальные', 'Детские', 'С подъемным механизмом']
      },
      {
        title: 'Размер',
        items: ['90×200', '120×200', '140×200', '160×200', '180×200']
      },
      {
        title: 'Стиль',
        items: ['Классические', 'Современные', 'Минималистичные']
      },
      {
        title: 'Материал',
        items: ['Дерево', 'ЛДСП', 'Металл', 'Комбинированные']
      }
    ],
    promos: [
      {
        title: 'Конфигуратор кроватей',
        description: 'создайте свою идеальную кровать',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  sofas: {
    title: 'Диваны и кресла',
    categories: [
      {
        title: 'Все диваны',
        items: ['Прямые', 'Угловые', 'Модульные', 'Кресла']
      },
      {
        title: 'Механизм',
        items: ['Еврокнижка', 'Аккордеон', 'Дельфин']
      },
      {
        title: 'Материал обивки',
        items: ['Рогожка', 'Велюр', 'Экокожа', 'Шенилл']
      }
    ],
    promos: [
      {
        title: 'Подборщик диванов',
        description: 'найдите идеальный диван для вашего интерьера',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'
      }
    ]
  }
};

const CatalogMenu: React.FC<CatalogMenuProps> = ({ isOpen, onClose }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('mattresses');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (hoveredCategory) {
      hoverTimerRef.current = setTimeout(() => {
        setSelectedCategory(hoveredCategory);
      }, 500);
    }
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [hoveredCategory]);

  if (!isOpen) return null;

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowSubmenu(true);
  };

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  const handleBackClick = () => {
    setShowSubmenu(false);
  };

  const currentContent = categoryContent[selectedCategory] || categoryContent.mattresses;

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto catalog-menu">
        {!showSubmenu ? (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={onClose} className="text-gray-600">
                <X size={24} />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2">
                <Logo variant="horizontal" className="-my-2" />
              </div>
              <a href="tel:+992905339595" className="text-gray-600">
                <Phone size={24} />
              </a>
            </div>
            <div className="divide-y">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className="flex items-center justify-between w-full p-4 text-left hover:text-teal-600"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={24} className="text-gray-400" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={handleBackClick} className="text-gray-600">
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <h2 className="text-lg font-semibold">{currentContent.title}</h2>
              <button onClick={onClose} className="text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="divide-y">
              {currentContent.categories.map((category) => (
                <div key={category.title} className="p-4">
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="flex items-center justify-between text-gray-700 hover:text-teal-600"
                      >
                        <span>{item}</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              {currentContent.promos.map((promo) => (
                <div key={promo.title} className="p-4">
                  <a
                    href="#"
                    className="flex items-center justify-between bg-teal-50 rounded-lg p-4 hover:bg-teal-100"
                  >
                    <div>
                      <h4 className="font-semibold text-teal-600">{promo.title}</h4>
                      <p className="text-sm text-gray-600">{promo.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-teal-600" />
                  </a>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 p-4 bg-white border-t">
              <button className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600">
                Посмотреть все товары
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block fixed inset-x-0 top-[144px] bottom-0 bg-black bg-opacity-50 z-40 catalog-menu">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex h-full bg-white">
            {/* Left Panel - Categories */}
            <div className="w-[280px] border-r">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Каталог</h2>
              </div>

              <div className="py-2">
                {menuItems.map((item) => (
                  <CategoryMenuItem
                    key={item.id}
                    item={item}
                    isSelected={selectedCategory === item.id}
                    onCategoryClick={handleCategoryClick}
                    onCategoryHover={handleCategoryHover}
                    onCategoryLeave={handleCategoryLeave}
                  />
                ))}
              </div>
            </div>

            {/* Right Panel - Category Content */}
            <CategoryContent content={currentContent} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogMenu;