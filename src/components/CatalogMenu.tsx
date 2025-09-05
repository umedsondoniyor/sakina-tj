// CatalogMenu.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Bed, BedDouble, Box, Sofa, Pill as Pillow, Baby, Phone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';            // ⬅️ add
import Logo from './Logo';
import CategoryMenuItem from './catalog/CategoryMenuItem';
import CategoryContent from './catalog/CategoryContent';

// ... (your types / menuItems / categoryContent are unchanged)

const CatalogMenu: React.FC<CatalogMenuProps> = ({ isOpen, onClose }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('mattresses');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();                         // ⬅️ add

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

  const handleCategoryHover = (categoryId: string) => setHoveredCategory(categoryId);
  const handleCategoryLeave = () => {
    setHoveredCategory(null);
    hoverTimerRef.current && clearTimeout(hoverTimerRef.current);
  };
  const handleBackClick = () => setShowSubmenu(false);

  // 👉 Translate a clicked item to ProductsPage "state"
  function mapClickToPreset(sectionTitle: string, itemLabel: string) {
    // defaults
    const state: any = { selectedCategories: [selectedCategory], preset: {} };

    // Section: Тип матраса
    if (/тип матраса/i.test(sectionTitle)) {
      state.preset.mattressType = [itemLabel]; // e.g. "Ортопедический"
    }

    // Section: Жесткость
    if (/жестк/i.test(sectionTitle)) {
      state.preset.hardness = [itemLabel]; // "Жесткая", "Средняя", ...
    }

    // Section: Размер — like "160×200"
    if (/размер/i.test(sectionTitle)) {
      const m = itemLabel.match(/(\d+)\D+(\d+)/);
      if (m) {
        const [_, w, l] = m;
        state.preset.width  = [Number(w), Number(w)];
        state.preset.length = [Number(l), Number(l)];
      }
    }

    // Section: Цена (examples)
    if (/цена/i.test(sectionTitle)) {
      if (/до\s*1500/i.test(itemLabel)) state.preset.price = [0, 1500];
      if (/1500.*3000/i.test(itemLabel)) state.preset.price = [1500, 3000];
      if (/3000.*6000/i.test(itemLabel)) state.preset.price = [3000, 6000];
      if (/6000\+\s*/i.test(itemLabel)) state.preset.price = [6000, Number.MAX_SAFE_INTEGER];
    }

    return state;
  }

  // Called from both mobile list and desktop content
  const goToProducts = (sectionTitle: string, itemLabel: string) => {
    const state = mapClickToPreset(sectionTitle, itemLabel);
    navigate('/products', { state });
    onClose(); // close menu
  };

  const currentContent = categoryContent[selectedCategory] || categoryContent.mattresses;

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto catalog-menu">
        {!showSubmenu ? (
          <>
            {/* header ... unchanged */}
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
            {/* submenu header ... unchanged */}
            <div className="divide-y">
              {currentContent.categories.map((section) => (
                <div key={section.title} className="p-4">
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <div className="space-y-4">
                    {section.items.map((label) => (
                      <button
                        key={label}
                        onClick={() => goToProducts(section.title, label)}     {/* ⬅️ navigate */}
                        className="flex items-center justify-between w-full text-left text-gray-700 hover:text-teal-600"
                      >
                        <span>{label}</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {/* promos unchanged */}
            </div>
            {/* footer button unchanged */}
          </>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block fixed inset-x-0 top-[144px] bottom-0 bg-black bg-opacity-50 z-40 catalog-menu">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex h-full bg-white">
            {/* Left panel unchanged */}
            {/* Right Panel – pass click handler down */}
            <CategoryContent
              content={currentContent}
              onItemClick={(sectionTitle, itemLabel) => goToProducts(sectionTitle, itemLabel)}  // ⬅️ new prop
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogMenu;
