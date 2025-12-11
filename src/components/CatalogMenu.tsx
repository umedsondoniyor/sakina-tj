import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Bed, BedDouble, Sofa, Box, Baby, Pill as Pillow, X, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Logo from './Logo';
import CategoryMenuItem from './catalog/CategoryMenuItem';
import CategoryContent from './catalog/CategoryContent';

type MenuItem = {
  id: string;
  name: string;
  icon: React.ElementType;
};

type RightPanelSection = {
  title: string;
  items: string[];
};

interface CatalogMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_BY_CATEGORY: Record<string, React.ElementType> = {
  mattresses: Bed,
  beds: BedDouble,
  sofas: Sofa,
  pillows: Pillow,
  blankets: Box,
  covers: Box,
  kids: Baby,
  furniture: Box,
  smartchair: Sofa,
  map: Box,
};

const RU_NAME: Record<string, string> = {
  mattresses: 'Матрасы',
  beds: 'Кровати',
  sofas: 'Диваны и кресла',
  pillows: 'Подушки',
  blankets: 'Одеяла',
  covers: 'Чехлы',
  kids: 'Для детей',
  furniture: 'Мебель',
  smartchair: 'Массажные кресла',
  map: 'Карты',
};

// Helper to generate dynamic price ranges based on min/max prices
const generatePriceRanges = (minPrice: number, maxPrice: number): string[] => {
  if (minPrice === maxPrice || maxPrice === 0) {
    return [`${Math.round(minPrice)} c.`];
  }

  const ranges: string[] = [];
  const diff = maxPrice - minPrice;
  
  // Calculate smart ranges based on price spread
  if (diff < 1000) {
    // Small range: just show min and max
    ranges.push(`До ${Math.round(maxPrice)} c.`);
  } else if (diff < 3000) {
    // Medium range: 2-3 ranges
    const mid = Math.round((minPrice + maxPrice) / 2);
    ranges.push(`До ${mid} c.`);
    ranges.push(`${mid}+ c.`);
  } else if (diff < 6000) {
    // Large range: 3-4 ranges
    const third1 = Math.round(minPrice + diff / 3);
    const third2 = Math.round(minPrice + (diff * 2) / 3);
    ranges.push(`До ${third1} c.`);
    ranges.push(`${third1}–${third2} c.`);
    ranges.push(`${third2}+ c.`);
  } else {
    // Very large range: 4 ranges
    const quarter1 = Math.round(minPrice + diff / 4);
    const quarter2 = Math.round(minPrice + diff / 2);
    const quarter3 = Math.round(minPrice + (diff * 3) / 4);
    ranges.push(`До ${quarter1} c.`);
    ranges.push(`${quarter1}–${quarter2} c.`);
    ranges.push(`${quarter2}–${quarter3} c.`);
    ranges.push(`${quarter3}+ c.`);
  }

  return ranges;
};

const CatalogMenu: React.FC<CatalogMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [rightContent, setRightContent] = useState<RightPanelSection[]>([]);
  const [loading, setLoading] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout>();

  // Load categories
useEffect(() => {
  if (!isOpen) return;

    const loadCategories = async () => {
      try {
        // Get all products to count categories
        const { data: products } = await supabase.from('products').select('category');
        const categoryCounts = new Map<string, number>();
        (products || []).forEach((p: any) => {
          const cat = p.category;
          if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        });

        // Try categories table first
        const { data: categories } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        let items: MenuItem[] = [];

        if (categories && categories.length > 0) {
          items = categories
            .map((c: any) => {
              const id = c.slug || c.name?.toLowerCase() || '';
              if (!id || !categoryCounts.has(id)) return null;
      return {
        id,
                name: c.name || RU_NAME[id] || id,
        icon: ICON_BY_CATEGORY[id] || Box,
              };
        })
        .filter(Boolean) as MenuItem[];
    } else {
          // Fallback: use product categories
          items = Array.from(categoryCounts.keys())
            .map((id) => ({
              id,
              name: RU_NAME[id] || id,
              icon: ICON_BY_CATEGORY[id] || Box,
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        }

    setMenuItems(items);
        if (items.length > 0 && !selectedCategory) {
          setSelectedCategory(items[0].id);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, [isOpen, selectedCategory]);

  // Debounced hover
  useEffect(() => {
    if (!hoveredCategory) return;
    hoverTimerRef.current = setTimeout(() => {
      setSelectedCategory(hoveredCategory);
    }, 300);
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [hoveredCategory]);

  // Load category content
  useEffect(() => {
    if (!isOpen || !selectedCategory) {
      setRightContent([]);
      return;
    }

    const loadContent = async () => {
      setLoading(true);
      try {
        // Get all products in category with prices
        const { data: products } = await supabase
        .from('products')
          .select('id, hardness, mattress_type, price')
        .eq('category', selectedCategory);

        // Get variant prices too (they might be different)
        const productIds = (products || []).map((p: any) => p.id);
        const { data: variants } = productIds.length > 0
          ? await supabase
        .from('product_variants')
              .select('width_cm, length_cm, size_name, price, product_id')
              .in('product_id', productIds)
          : { data: [] };

        // Collect all prices (from products and variants)
        const allPrices: number[] = [];
        (products || []).forEach((p: any) => {
          if (p.price) allPrices.push(Number(p.price));
        });
        (variants || []).forEach((v: any) => {
          if (v.price) allPrices.push(Number(v.price));
        });

        // Calculate min/max prices
        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
        const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

        // Build sections
      const sections: RightPanelSection[] = [];

        // Hardness
        const hardness = [...new Set((products || []).map((p: any) => p.hardness).filter(Boolean))];
        if (hardness.length > 0) {
          sections.push({ title: 'Жесткость', items: hardness });
        }

        // Mattress types (only for mattresses)
        if (selectedCategory === 'mattresses') {
          const types = [...new Set((products || []).map((p: any) => p.mattress_type).filter(Boolean))];
          if (types.length > 0) {
            sections.push({ title: 'Тип матраса', items: types });
          }
        }

        // Sizes
        const sizes = [...new Set(
          (variants || []).map((v: any) => {
            if (v.width_cm && v.length_cm) return `${v.width_cm}×${v.length_cm}`;
            return v.size_name;
          }).filter(Boolean)
        )].slice(0, 18);
        if (sizes.length > 0) {
          sections.push({ title: 'Размер', items: sizes });
        }

        // Dynamic price ranges based on actual prices
        if (minPrice > 0 && maxPrice > 0) {
          const priceRanges = generatePriceRanges(minPrice, maxPrice);
          sections.push({ title: 'Цена', items: priceRanges });
        }

        setRightContent(sections);
      } catch (error) {
        console.error('Error loading content:', error);
        setRightContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isOpen, selectedCategory]);

  const handleNavigate = (categoryId: string, filter?: { section: string; item: string }) => {
    let url = `/products?category=${encodeURIComponent(categoryId)}`;
    
    if (filter) {
      const state: any = { selectedCategories: [categoryId] };
      
      if (filter.section === 'Жесткость') {
        state.presetFilters = { hardness: [filter.item] };
      } else if (filter.section === 'Тип матраса') {
        state.presetFilters = { mattressType: [filter.item] };
      } else if (filter.section === 'Размер') {
        const match = filter.item.match(/^(\d+)[×xX](\d+)$/);
      if (match) {
          state.presetFilters = { width: [Number(match[1]), Number(match[1])], length: [Number(match[2]), Number(match[2])] };
        }
      } else if (filter.section === 'Цена') {
        // Parse dynamic price ranges
        // Format examples: "До 1500 c.", "1500–3000 c.", "3000+ c."
        if (filter.item.startsWith('До')) {
          const match = filter.item.match(/До\s*(\d+)/);
          if (match) {
            const max = Number(match[1]);
            state.presetFilters = { price: [0, max] };
          }
        } else if (filter.item.includes('–')) {
          // Range like "1500–3000 c."
          const match = filter.item.match(/(\d+)\s*–\s*(\d+)/);
          if (match) {
            const min = Number(match[1]);
            const max = Number(match[2]);
            state.presetFilters = { price: [min, max] };
          }
        } else if (filter.item.includes('+')) {
          // Range like "3000+ c."
          const match = filter.item.match(/(\d+)\+/);
          if (match) {
            const min = Number(match[1]);
            state.presetFilters = { price: [min, 999999] };
          }
        } else {
          // Single price like "1500 c."
          const match = filter.item.match(/(\d+)/);
          if (match) {
            const price = Number(match[1]);
            state.presetFilters = { price: [price, price] };
          }
        }
      }
      
      navigate(url, { state });
    } else {
      navigate(url);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto catalog-menu">
        {!showSubmenu ? (
          <>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
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
              {menuItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Категории не найдены</p>
                </div>
              ) : (
                menuItems.map((item) => (
                <button
                  key={item.id}
                    onClick={() => {
                      setSelectedCategory(item.id);
                      setShowSubmenu(true);
                    }}
                    className="flex items-center justify-between w-full p-4 text-left hover:text-teal-600 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={24} className="text-gray-400" />
                      <span className="font-medium">{item.name}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <button
                onClick={() => setShowSubmenu(false)}
                className="text-gray-600"
              >
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <h2 className="text-lg font-semibold">
                {RU_NAME[selectedCategory] || 'Каталог'}
              </h2>
              <button onClick={onClose} className="text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="divide-y pb-20">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Загрузка…</p>
                </div>
              ) : rightContent.length > 0 ? (
                rightContent.map((section) => (
                  <div key={section.title} className="p-4">
                    <h3 className="font-semibold mb-3 text-gray-900">{section.title}</h3>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleNavigate(selectedCategory, { section: section.title, item })}
                          className="flex items-center justify-between w-full text-gray-700 hover:text-teal-600 transition-colors py-2"
                        >
                          <span>{item}</span>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Нет доступных фильтров</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 p-4 bg-white border-t">
              <button
                onClick={() => handleNavigate(selectedCategory)}
                className="w-full bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
              >
                Посмотреть все товары
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop View */}
      <div
        className="hidden md:block fixed inset-x-0 top-[144px] bottom-0 bg-black/50 z-40 catalog-menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex h-full bg-white shadow-xl rounded-t-lg overflow-hidden">
            {/* Left Panel */}
            <div className="w-[280px] border-r overflow-y-auto">
              <div className="p-4 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Каталог</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Закрыть"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="py-2">
                {menuItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Категории не найдены
                  </div>
                ) : (
                  menuItems.map((item) => (
                  <CategoryMenuItem
                    key={item.id}
                    item={item}
                    isSelected={selectedCategory === item.id}
                      onCategoryClick={setSelectedCategory}
                      onCategoryHover={setHoveredCategory}
                      onCategoryLeave={() => {
                        setHoveredCategory(null);
                        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Panel */}
            <CategoryContent
              content={{
                title: RU_NAME[selectedCategory] || 'Каталог',
                categories: loading
                  ? [{ title: 'Загрузка…', items: [] }]
                  : rightContent,
                promos: [],
              }}
              onItemClick={(sectionTitle, item) =>
                handleNavigate(selectedCategory, { section: sectionTitle, item })
              }
              onSeeAll={() => handleNavigate(selectedCategory)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogMenu;

