import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Bed, BedDouble, Sofa, Box, Baby, Pill as Pillow, X, Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Logo from './Logo';
import CategoryMenuItem from './catalog/CategoryMenuItem';
import CategoryContent from './catalog/CategoryContent';

type MenuItem = {
  id: string;       // slug or category key used elsewhere (e.g., 'mattresses')
  name: string;     // display name (RU)
  icon: React.ElementType;
};

type RightPanelSection = {
  title: string;
  items: string[];  // label list; we’ll map clicks to filters
};

type RightPanelPromo = {
  title: string;
  description: string;
  image: string;
};

type RightPanelContent = {
  title: string;
  categories: RightPanelSection[];
  promos: RightPanelPromo[];
};

interface CatalogMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ---------- Icon mapping for known categories ---------- */
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

/* ---------- RU display names for categories ---------- */
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

/* ---------- Helpers ---------- */
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const asSizeLabel = (w?: number | null, l?: number | null) =>
  w && l ? `${w}×${l}` : null;

const CatalogMenu: React.FC<CatalogMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('mattresses');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [rightContent, setRightContent] = useState<RightPanelContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const hoverTimerRef = useRef<NodeJS.Timeout>();

  /* Load categories (prefer the `categories` table; fallback to distinct product categories) */
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      // Try categories table
      const { data: cats, error: catsErr } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      let list: { id: string; name: string }[] = [];
      if (!catsErr && cats && cats.length) {
        // Try to pick a stable id/slug/name
        list = cats.map((c: any) => ({
          id: (c.slug || c.key || c.id || '').toString() || (c.name || '').toString().toLowerCase(),
          name: c.display_name || c.name || RU_NAME[(c.slug || c.key || '').toString()] || (c.name || 'Категория'),
        }));
      } else {
        // Fallback: distinct categories from products
        const { data: prodCats, error: pcErr } = await supabase
          .from('products')
          .select('category', { distinct: true })
          .order('category', { ascending: true });

        if (!pcErr && prodCats) {
          list = prodCats
            .map((row: any) => row.category as string)
            .filter(Boolean)
            .map((id: string) => ({
              id,
              name: RU_NAME[id] || id,
            }));
        }
      }

      const items: MenuItem[] = list.map(({ id, name }) => ({
        id,
        name,
        icon: ICON_BY_CATEGORY[id] || Box,
      }));

      setMenuItems(items);
      if (items.length && !items.find((i) => i.id === selectedCategory)) {
        setSelectedCategory(items[0].id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* Debounced hover → change selected category */
  useEffect(() => {
    if (!hoveredCategory) return;
    hoverTimerRef.current = setTimeout(() => {
      setSelectedCategory(hoveredCategory);
    }, 350);
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [hoveredCategory]);

  /* Load right-panel content dynamically for the selected category */
  useEffect(() => {
    if (!isOpen || !selectedCategory) return;

    (async () => {
      setLoadingContent(true);

      // 1) Distinct hardness (products)
      const { data: hardnessRows } = await supabase
        .from('products')
        .select('hardness, category', { distinct: true })
        .eq('category', selectedCategory);

      const hardness = uniq(
        (hardnessRows || [])
          .map((r: any) => r.hardness as string)
          .filter(Boolean)
      );

      // 2) Distinct mattress types (products)
      const { data: typeRows } = await supabase
        .from('products')
        .select('mattress_type, category', { distinct: true })
        .eq('category', selectedCategory);

      const mattressTypes = uniq(
        (typeRows || [])
          .map((r: any) => r.mattress_type as string)
          .filter(Boolean)
      );

      // 3) Distinct sizes (product_variants)
      const { data: sizeRows } = await supabase
        .from('product_variants')
        .select('width_cm,length_cm, size_name, product_id, products!inner(category)')
        .eq('products.category', selectedCategory);

      const sizeLabels = uniq(
        (sizeRows || [])
          .map((r: any) => asSizeLabel(Number(r.width_cm), Number(r.length_cm)) || r.size_name)
          .filter(Boolean)
      );

      // 4) Promos (optional): pull from navigation or hardcode a tasteful default
      const promos: RightPanelPromo[] = [
        {
          title: `Подборщик ${RU_NAME[selectedCategory] || 'товаров'}`,
          description: 'подберите идеальный вариант по параметрам',
          image:
            selectedCategory === 'mattresses'
              ? 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png'
              : 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        },
      ];

      // 5) Assemble sections
      const sections: RightPanelSection[] = [];

      if (selectedCategory === 'mattresses') {
        if (mattressTypes.length) {
          sections.push({ title: 'Тип матраса', items: mattressTypes });
        }
        if (hardness.length) {
          sections.push({ title: 'Жесткость', items: hardness });
        }
        if (sizeLabels.length) {
          sections.push({ title: 'Размер', items: sizeLabels.slice(0, 18) });
        }
        sections.push({
          title: 'Цена',
          items: ['До 1500 c.', '1500–3000 c.', '3000–6000 c.', '6000+ c.'],
        });
      } else {
        if (sizeLabels.length) {
          sections.push({ title: 'Размер', items: sizeLabels.slice(0, 18) });
        }
        if (hardness.length) {
          // Many non-mattress products won't have this — we only add if present.
          sections.push({ title: 'Жесткость', items: hardness });
        }
        sections.push({
          title: 'Цена',
          items: ['До 1500 c.', '1500–3000 c.', '3000–6000 c.', '6000+ c.'],
        });
      }

      setRightContent({
        title: RU_NAME[selectedCategory] || 'Категория',
        categories: sections,
        promos,
      });
      setLoadingContent(false);
    })();
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  /* ---------- Navigation helpers ---------- */
  const goCategory = (catId: string) => {
    // Go to /products with ?category=<catId>
    navigate(`/products?category=${encodeURIComponent(catId)}`);
    onClose();
  };

  // Used by the right panel clicks: map section+item to ProductsPage filters via `state`
  const goWithFilter = (catId: string, sectionTitle: string, item: string) => {
    const state: any = { selectedCategories: [catId] };

    if (sectionTitle === 'Жесткость') {
      state.presetFilters = { hardness: [item] };
    } else if (sectionTitle === 'Тип матраса') {
      state.presetFilters = { mattressType: [item] };
    } else if (sectionTitle === 'Размер') {
      // Parse "W×L" if present
      const match = item.match(/^(\d+)[×xX](\d+)$/);
      if (match) {
        const w = Number(match[1]);
        const l = Number(match[2]);
        state.presetFilters = { width: [w, w], length: [l, l] };
      }
    } else if (sectionTitle === 'Цена') {
      // Very simple price bands (you can tune in ProductsPage if needed)
      if (item.startsWith('До')) state.presetFilters = { price: [0, 1500] };
      else if (item.includes('1500–3000')) state.presetFilters = { price: [1500, 3000] };
      else if (item.includes('3000–6000')) state.presetFilters = { price: [3000, 6000] };
      else state.presetFilters = { price: [6000, Number.MAX_SAFE_INTEGER] };
    }

    navigate(`/products?category=${encodeURIComponent(catId)}`, { state });
    onClose();
  };

  /* ---------- Handlers for UI ---------- */
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowSubmenu(true);
  };
  const handleCategoryHover = (categoryId: string) => setHoveredCategory(categoryId);
  const handleCategoryLeave = () => {
    setHoveredCategory(null);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };
  const handleBackClick = () => setShowSubmenu(false);

  const current = rightContent;

  /* ---------- Rendering ---------- */
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
              <h2 className="text-lg font-semibold">
                {current?.title || RU_NAME[selectedCategory] || 'Каталог'}
              </h2>
              <button onClick={onClose} className="text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="divide-y">
              {/* Sections */}
              {loadingContent ? (
                <div className="p-4 text-gray-500">Загрузка…</div>
              ) : (
                current?.categories.map((section) => (
                  <div key={section.title} className="p-4">
                    <h3 className="font-semibold mb-2">{section.title}</h3>
                    <div className="space-y-4">
                      {section.items.map((label) => (
                        <button
                          key={label}
                          onClick={() => goWithFilter(selectedCategory, section.title, label)}
                          className="flex items-center justify-between w-full text-gray-700 hover:text-teal-600"
                        >
                          <span>{label}</span>
                          <ChevronRight size={20} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Promos */}
              {(current?.promos || []).map((promo) => (
                <div key={promo.title} className="p-4">
                  <button
                    onClick={() => goCategory(selectedCategory)}
                    className="flex items-center justify-between bg-teal-50 rounded-lg p-4 hover:bg-teal-100 w-full text-left"
                  >
                    <div>
                      <h4 className="font-semibold text-teal-600">{promo.title}</h4>
                      <p className="text-sm text-gray-600">{promo.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-teal-600" />
                  </button>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 p-4 bg-white border-t">
              <button
                onClick={() => goCategory(selectedCategory)}
                className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600"
              >
                Посмотреть все товары
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop View (overlay) */}
      <div className="hidden md:block fixed inset-x-0 top-[144px] bottom-0 bg-black/50 z-40 catalog-menu">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex h-full bg-white">
            {/* Left Panel */}
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
                    onCategoryClick={(id: string) => {
                      setSelectedCategory(id);
                      // desktop: keep right panel visible, not switching to mobile submenu
                    }}
                    onCategoryHover={handleCategoryHover}
                    onCategoryLeave={handleCategoryLeave}
                  />
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <CategoryContent
              content={{
                title: current?.title || RU_NAME[selectedCategory] || 'Каталог',
                categories: loadingContent
                  ? [{ title: 'Загрузка…', items: [] }]
                  : current?.categories || [],
                promos: current?.promos || [],
              }}
              // If your CategoryContent supports item clicks, wire them:
              onItemClick={(sectionTitle: string, item: string) =>
                goWithFilter(selectedCategory, sectionTitle, item)
              }
              onSeeAll={() => goCategory(selectedCategory)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogMenu;
