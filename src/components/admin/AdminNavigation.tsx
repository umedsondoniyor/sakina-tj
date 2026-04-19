import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import NavigationItemModal, { type NavigationItemTable } from './NavigationItemModal';
import type { NavigationItem } from '../../lib/types';

const MenuItemsList: React.FC<{
  items: NavigationItem[];
  onEdit: (item: NavigationItem) => void;
  onDelete: (id: string) => void;
  toggleActive: (item: NavigationItem) => void;
  moveItem: (itemId: string, direction: 'up' | 'down') => void;
  emptyTitle: string;
  emptyHint: string;
}> = ({ items, onEdit, onDelete, toggleActive, moveItem, emptyTitle, emptyHint }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <PackageOpen className="mx-auto h-10 w-10 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                {item.icon_image_url ? (
                  <img src={item.icon_image_url} alt={item.title} className="w-8 h-8" />
                ) : (
                  <span className="text-xs text-gray-500">{item.icon_name || 'Icon'}</span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">
                  Slug: {item.category_slug} • Порядок: {item.order_index}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleActive(item)}
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.is_active ? <Eye size={14} className="mr-1" /> : <EyeOff size={14} className="mr-1" />}
                {item.is_active ? 'Виден' : 'Скрыт'}
              </button>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <div className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-2 text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminNavigation = () => {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTable, setModalTable] = useState<NavigationItemTable>('navigation_items');
  const [selectedItem, setSelectedItem] = useState<NavigationItem | undefined>();

  const fetchAll = useCallback(async () => {
    try {
      const [navRes, catRes] = await Promise.all([
        supabase.from('navigation_items').select('*').order('order_index', { ascending: true }),
        supabase.from('catalog_menu_items').select('*').order('order_index', { ascending: true }),
      ]);

      if (navRes.error) throw navRes.error;
      if (catRes.error) throw catRes.error;

      setNavItems((navRes.data ?? []) as NavigationItem[]);
      setCatalogItems((catRes.data ?? []) as NavigationItem[]);
    } catch (error) {
      console.error('Error loading navigation:', error);
      toast.error('Не удалось загрузить навигацию');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openModal = (table: NavigationItemTable, item?: NavigationItem) => {
    setModalTable(table);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (table: NavigationItemTable, id: string) => {
    if (!confirm('Удалить этот пункт?')) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      if (table === 'navigation_items') {
        setNavItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setCatalogItems((prev) => prev.filter((i) => i.id !== id));
      }
      toast.success('Удалено');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось удалить');
    }
  };

  const toggleActive = async (table: NavigationItemTable, item: NavigationItem) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !item.is_active })
        .eq('id', item.id);
      if (error) throw error;

      const patch = { ...item, is_active: !item.is_active };
      if (table === 'navigation_items') {
        setNavItems((prev) => prev.map((i) => (i.id === item.id ? patch : i)));
      } else {
        setCatalogItems((prev) => prev.map((i) => (i.id === item.id ? patch : i)));
      }
      toast.success(item.is_active ? 'Скрыто' : 'Показано');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось обновить');
    }
  };

  const moveItem = async (table: NavigationItemTable, itemId: string, direction: 'up' | 'down') => {
    const list = table === 'navigation_items' ? navItems : catalogItems;
    const itemIndex = list.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= list.length) return;

    const reordered = [...list];
    [reordered[itemIndex], reordered[newIndex]] = [reordered[newIndex], reordered[itemIndex]];

    try {
      const results = await Promise.all(
        reordered.map((item, i) => supabase.from(table).update({ order_index: i }).eq('id', item.id)),
      );
      const firstErr = results.find((r) => r.error)?.error;
      if (firstErr) throw firstErr;

      const patched = reordered.map((item, i) => ({ ...item, order_index: i }));
      if (table === 'navigation_items') setNavItems(patched);
      else setCatalogItems(patched);

      toast.success('Порядок обновлён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось изменить порядок');
      await fetchAll();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-12 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold mb-2">Навигация</h1>
        <p className="text-sm text-gray-600">
          Два независимых списка: верхняя строка под логотипом и левая колонка выпадающего каталога.
        </p>
      </div>

      <section>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold">Верхнее меню</h2>
            <p className="text-sm text-gray-600 mt-1">
              Пункты под строкой поиска (категории, о компании и т.д.).
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal('navigation_items')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </button>
        </div>

        <MenuItemsList
          items={navItems}
          onEdit={(item) => openModal('navigation_items', item)}
          onDelete={(id) => handleDelete('navigation_items', id)}
          toggleActive={(item) => toggleActive('navigation_items', item)}
          moveItem={(id, dir) => moveItem('navigation_items', id, dir)}
          emptyTitle="Нет пунктов верхнего меню"
          emptyHint="Добавьте первый пункт или проверьте данные в базе."
        />
      </section>

      <section>

        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold">Каталог (кнопка «Каталог»)</h2>
            <p className="text-sm text-gray-600 mt-1">
              Резервный список: используется на сайте только если в «Категории каталога» нет ни одной записи. Иначе порядок и состав левой колонки берутся из раздела «Категории каталога».
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal('catalog_menu_items')}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </button>
        </div>

        <MenuItemsList
          items={catalogItems}
          onEdit={(item) => openModal('catalog_menu_items', item)}
          onDelete={(id) => handleDelete('catalog_menu_items', id)}
          toggleActive={(item) => toggleActive('catalog_menu_items', item)}
          moveItem={(id, dir) => moveItem('catalog_menu_items', id, dir)}
          emptyTitle="Нет пунктов каталога"
          emptyHint="Добавьте пункты или выполните миграцию БД (таблица catalog_menu_items)."
        />
      </section>

      <NavigationItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        table={modalTable}
        onSuccess={fetchAll}
      />
    </div>
  );
};

export default AdminNavigation;
