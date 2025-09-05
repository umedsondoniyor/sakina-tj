import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Bed, BedDouble, Box, Sofa, Pill as Pillow, Baby, X, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
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

interface CategoryContentBlock {
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
  { id: 'beds',        name: 'Кровати', icon: BedDouble },
  { id: 'sofas',       name: 'Диваны и кресла', icon: Sofa },
  { id: 'covers',      name: 'Чехлы', icon: Box },
  { id: 'pillows',     name: 'Подушки', icon: Pillow },
  { id: 'blankets',    name: 'Одеяла', icon: Box },
  { id: 'kids',        name: 'Для детей', icon: Baby },
];

// Your existing content (unchanged)
const categoryContent: Record<string, CategoryContentBlock> = {
  mattresses: {
    title: 'Матрасы',
    categories: [
      { title: 'Все матрасы', items: ['Однослойные', 'Двуслойные', 'Комплект матрас + кровать', 'В рулонах', 'Детские'] },
      { title: 'Размер',      items: ['90×200', '120×200', '140×200', '160×200', '180×200', '200×200'] },
      { title: 'Жесткость',   items: ['Жесткие', 'Средней жесткости', 'Мягкие', 'Разная жесткость сторон'] },
      { title: 'Вид',         items: ['Ортопедические', 'Пружинные', 'Беспружинные'] },
      { title: 'Цена',        items: ['Недорогие матрасы', 'Премиум', 'Матрасы со скидкой'] },
      { title: 'Другие товары', items: ['Топперы/наматрасники', 'Защитные чехлы'] }
    ],
    promos: [
      { title: 'Подборщик матрасов', description: 'создайте идеальное место для сна', image: 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png' },
      { title: 'Матрас — ключ к вашему сну', description: 'доверьте будущий здоровый сон', image: 'https://ik.imagekit.io/3js0rb3pk/cover3.png' }
    ]
  },
  beds: {
    title: 'Кровати',
    categories: [
      { title: 'Все кровати', items: ['Двуспальные', 'Односпальные', 'Детские', 'С подъемным механизмом'] },
      { title: 'Размер',      items: ['90×200', '120×200', '140×200', '160×200', '180×200'] },
      { title: 'Стиль',       items: ['Классические', 'Современные', 'Минималистичные'] },
      { title: 'Материал',    items: ['Дерево', 'ЛДСП', 'Металл', 'Комбинированные'] }
    ],
    promos: [
      { title: 'Конфигуратор кроватей', description: 'создайте свою идеальную кровать', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  sofas: {
    title: 'Диваны и кресла',
    categories: [
      { title: 'Все диваны', items: ['Прямые', 'Угловые', 'Модульные', 'Кресла'] },
      { title: 'Механизм',   items: ['Еврокнижка', 'Аккордеон', 'Дельфин'] },
      { title: 'Материал обивки', items: ['Рогожка', 'Велюр', 'Экокожа', 'Шенилл'] }
    ],
    promos: [
      { title: 'Подборщик диванов', description: 'найдите идеальный диван для вашего интерьера', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' }
    ]
  }
};

/* -------------------- Linking helpers -------------------- */

// Turn filters into a /products?query
function buildProductsUrl(params: {
  category?: string | string[];
  hardness?: string | string[];
  widthMin?: number; widthMax?: number;
  lengthMin?: number; lengthMax?: number;
  heightMin?: number; heightMax?: number;
  priceMin?: number;  priceMax?: number;
  weightCategory?: string | string[];
  mattressType?: string | string[];
  inStock?: boolean;
}) {
  const sp = new URLSearchParams();
  const setCsv = (key: string, val?: string | string[]) => {
    if (!val) return;
    sp.set(key, Array.isArray(val) ? val.join(',') : val);
  };

  setCsv('category', params.category);
  setCsv('hardness', params.hardness);
  setCsv('mattressType', params.mattressType);
  setCsv('weightCategory', params.weightCategory);

  if (params.widthMin  != null) sp.set('widthMin',  String(params.widthMin));
  if (params.widthMax  != null) sp.set('widthMax',  String(params.widthMax));
  if (params.lengthMin != null) sp.set('lengthMin', String(params.lengthMin));
  if (params.lengthMax != null) sp.set('lengthMax', String(params.lengthMax));
  if (params.heightMin != null) sp.set('heightMin', String(params.heightMin));
  if (params.heightMax != null) sp.set('heightMax', String(params.heightMax));
  if (params.priceMin  != null) sp.set('priceMin',  String(params.priceMin));
  if (params.priceMax  != null) sp.set('priceMax',  String(params.priceMax));
  if (params.inStock)           sp.set('inStock', '1');

  const qs = sp.toString();
  return `/products${qs ? `?${qs}` : ''}`;
}

// Parse labels like "160×200" into width/length
function parseSize(label: string): { width?: number; length?: number } {
  const m = label.replace(' ', '').match(/^(\d+)[×xX*](\d+)$/);
  if (!m) return {};
  return { width: Number(m[1]), length: Number(m[2]) };
}

/** Convert a (categoryId, sectionTitle, itemLabel) into a deep link URL */
function mapItemToUrl(categoryId: string, sectionTitle: string, itemLabel: string): string {
  // Default: jump to category page only
  const base = { category: categoryId };

  // Matrices for mattresses examples
  if (categoryId === 'mattresses') {
    if (sectionTitle === 'Размер') {
      const { width, length } = parseSize(itemLabel);
      if (width && length) {
        return buildProductsUrl({ ...base, widthMin: width, widthMax: width, lengthMin: length, lengthMax: length });
      }
    }
    if (sectionTitle === 'Жесткость') {
      // Normalize your display → DB values here if needed
      const map: Record<string, string> = {
        'Жесткие': 'Жесткий',
        'Средней жесткости': 'Средняя',
        'Мягкие': 'Мягкий',
        'Разная жесткость сторон': 'Разная жесткость сторон',
      };
      const val = map[itemLabel] || itemLabel;
      return buildProductsUrl({ ...base, hardness: val });
    }
    if (sectionTitle === 'Вид') {
      // Example: map to mattressType or other filter as you store it
      const map: Record<string, string> = {
        'Ортопедические': 'Ортопедический',
        'Пружинные': 'Пружинный',
        'Беспружинные': 'Беспружинный',
      };
      const val = map[itemLabel] || itemLabel;
      return buildProductsUrl({ ...base, mattressType: val });
    }
    if (sectionTitle === 'Цена') {
      if (itemLabel.includes('Недорогие'))      return buildProductsUrl({ ...base, priceMax: 3000 });
      if (itemLabel.includes('Премиум'))        return buildProductsUrl({ ...base, priceMin: 3001 });
      if (itemLabel.includes('со скидкой'))     return buildProductsUrl({ ...base, priceMin: 1 }); // tweak as needed
    }
    if (sectionTitle === 'Все матрасы') {
      return buildProductsUrl(base);
    }
  }

  // Beds: sizes behave similarly
  if (categoryId === 'beds' && sectionTitle === 'Размер') {
    const { width, length } = parseSize(itemLabel);
    if (width && length) {
      return buildProductsUrl({ ...base, widthMin: width, widthMax: width, lengthMin: length, lengthMax: length });
    }
  }

  // Fallback: just go to the category
  return buildProductsUrl(base);
}

/* -------------------- Component -------------------- */

const CatalogMenu: React.FC<CatalogMenuProps> = ({ isOpen, onClose }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('mattresses');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (hoveredCategory) {
      hoverTimerRef.current = setTimeout(() => setSelectedCategory(hoveredCategory), 500);
    }
    return () => hoverTimerRef.current && clearTimeout(hoverTimerRef.current);
  }, [hoveredCategory]);

  if (!isOpen) return null;

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowSubmenu(true);
  };

  const currentContent = categoryContent[selectedCategory] || categoryContent.mattresses;

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto catalog-menu">
        {!showSubmenu ? (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={onClose} className="text-gray-600"><X size={24} /></button>
              <div className="absolute left-1/2 -translate-x-1/2"><Logo variant="horizontal" className="-my-2" /></div>
              <a href="tel:+992905339595" className="text-gray-600"><Phone size={24} /></a>
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
              <button onClick={() => setShowSubmenu(false)} className="text-gray-600">
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <h2 className="text-lg font-semibold">{currentContent.title}</h2>
              <button onClick={onClose} className="text-gray-600"><X size={24} /></button>
            </div>

            <div className="divide-y">
              {currentContent.categories.map((category) => (
                <div key={category.title} className="p-4">
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <Link
                        key={item}
                        to={mapItemToUrl(selectedCategory, category.title, item)}
                        className="flex items-center justify-between text-gray-700 hover:text-teal-600"
                        onClick={onClose}
                      >
                        <span>{item}</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {currentContent.promos.map((promo) => (
                <div key={promo.title} className="p-4">
                  <Link
                    to={buildProductsUrl({ category: selectedCategory })}
                    className="flex items-center justify-between bg-teal-50 rounded-lg p-4 hover:bg-teal-100"
                    onClick={onClose}
                  >
                    <div>
                      <h4 className="font-semibold text-teal-600">{promo.title}</h4>
                      <p className="text-sm text-gray-600">{promo.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-teal-600" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 p-4 bg-white border-t">
              <Link
                to={buildProductsUrl({ category: selectedCategory })}
                className="w-full block text-center bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600"
                onClick={onClose}
              >
                Посмотреть все товары
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Desktop overlay */}
      <div className="hidden md:block fixed inset-x-0 top-[144px] bottom-0 bg-black bg-opacity-50 z-40 catalog-menu">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex h-full bg-white">
            {/* Left panel */}
            <div className="w-[280px] border-r">
              <div className="p-4 border-b"><h2 className="text-lg font-semibold">Каталог</h2></div>
              <div className="py-2">
                {menuItems.map((item) => (
                  <CategoryMenuItem
                    key={item.id}
                    item={item}
                    isSelected={selectedCategory === item.id}
                    onCategoryClick={setSelectedCategory}
                    onCategoryHover={(id)=>setHoveredCategory(id)}
                    onCategoryLeave={()=>setHoveredCategory(null)}
                  />
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1">
              {/* Replace CategoryContent’s anchor tags with Links by passing a render prop if you prefer.
                  For quick win, we replicate list here using currentContent: */}
              <div className="grid grid-cols-3 gap-8 p-6">
                {currentContent.categories.map((block) => (
                  <div key={block.title}>
                    <h3 className="font-semibold mb-3">{block.title}</h3>
                    <ul className="space-y-2">
                      {block.items.map((it) => (
                        <li key={it}>
                          <Link
                            to={mapItemToUrl(selectedCategory, block.title, it)}
                            className="flex items-center justify-between text-gray-700 hover:text-teal-600"
                            onClick={onClose}
                          >
                            <span>{it}</span>
                            <ChevronRight size={18} className="text-gray-300" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <Link
                  to={buildProductsUrl({ category: selectedCategory })}
                  className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                  onClick={onClose}
                >
                  Посмотреть все товары
                  <ChevronRight size={18} className="ml-1" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogMenu;