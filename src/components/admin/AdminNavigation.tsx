import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import NavigationItemModal, { type NavigationItemTable } from './NavigationItemModal';
import type { NavigationItem } from '../../lib/types';

const addButtonClass =
  'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm shrink-0';

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
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-12 text-center">
        <PackageOpen className="mx-auto h-10 w-10 text-gray-400" aria-hidden />
        <h3 className="mt-3 text-sm font-semibold text-gray-900">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow ring-1 ring-black/[0.04]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                {item.icon_image_url ? (
                  <img src={item.icon_image_url} alt="" className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-[10px] font-medium text-gray-500 leading-tight text-center px-1">
                    {item.icon_name || '—'}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 gap-y-1">
                  <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.is_active
                        ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80'
                        : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                    }`}
                  >
                    {item.is_active ? <Eye size={12} aria-hidden /> : <EyeOff size={12} aria-hidden />}
                    {item.is_active ? 'Виден' : 'Скрыт'}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                  <span className="font-medium text-gray-600">Slug:</span> {item.category_slug}
                  <span className="mx-2 text-gray-300" aria-hidden>
                    |
                  </span>
                  <span className="font-medium text-gray-600">Порядок:</span> {item.order_index}
                  {item.link_url ? (
                    <>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="font-medium text-gray-600">Ссылка:</span>{' '}
                      <span className="break-all text-gray-600">{item.link_url}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 sm:border-l sm:border-gray-100 sm:pl-4 sm:ml-2 shrink-0">
              <div className="inline-flex flex-col rounded-lg bg-gray-50 p-0.5 border border-gray-100">
                <button
                  type="button"
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label="Выше"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label="Ниже"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-2.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
                aria-label="Редактировать"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

const AdminNavigation = () => {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<NavigationItem[]>([]);
  const [homeGridItems, setHomeGridItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTable, setModalTable] = useState<NavigationItemTable>('navigation_items');
  const [selectedItem, setSelectedItem] = useState<NavigationItem | undefined>();

  const fetchAll = useCallback(async () => {
    try {
      const [navRes, catRes, homeRes] = await Promise.all([
        supabase.from('navigation_items').select('*').order('order_index', { ascending: true }),
        supabase.from('catalog_menu_items').select('*').order('order_index', { ascending: true }),
        supabase.from('home_category_grid_items').select('*').order('order_index', { ascending: true }),
      ]);

      if (navRes.error) throw navRes.error;
      if (catRes.error) throw catRes.error;
      if (homeRes.error) throw homeRes.error;

      setNavItems((navRes.data ?? []) as NavigationItem[]);
      setCatalogItems((catRes.data ?? []) as NavigationItem[]);
      setHomeGridItems((homeRes.data ?? []) as NavigationItem[]);
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
      } else if (table === 'catalog_menu_items') {
        setCatalogItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setHomeGridItems((prev) => prev.filter((i) => i.id !== id));
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
      } else if (table === 'catalog_menu_items') {
        setCatalogItems((prev) => prev.map((i) => (i.id === item.id ? patch : i)));
      } else {
        setHomeGridItems((prev) => prev.map((i) => (i.id === item.id ? patch : i)));
      }
      toast.success(item.is_active ? 'Скрыто' : 'Показано');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось обновить');
    }
  };

  const moveItem = async (table: NavigationItemTable, itemId: string, direction: 'up' | 'down') => {
    const list =
      table === 'navigation_items'
        ? navItems
        : table === 'catalog_menu_items'
          ? catalogItems
          : homeGridItems;
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
      else if (table === 'catalog_menu_items') setCatalogItems(patched);
      else setHomeGridItems(patched);

      toast.success('Порядок обновлён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось изменить порядок');
      await fetchAll();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50/50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 sm:space-y-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Навигация</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Верхнее меню, резервный список каталога и плитки категорий на главной странице.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.06]">
          <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Верхнее меню</h2>
              <p className="mt-1 text-sm text-gray-600">
                Пункты под строкой поиска (категории, о компании и т.д.).
              </p>
            </div>
            <button type="button" onClick={() => openModal('navigation_items')} className={addButtonClass}>
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Добавить
            </button>
          </div>
          <div className="p-5 sm:p-6">
            <MenuItemsList
              items={navItems}
              onEdit={(item) => openModal('navigation_items', item)}
              onDelete={(id) => handleDelete('navigation_items', id)}
              toggleActive={(item) => toggleActive('navigation_items', item)}
              moveItem={(id, dir) => moveItem('navigation_items', id, dir)}
              emptyTitle="Нет пунктов верхнего меню"
              emptyHint="Добавьте первый пункт или проверьте данные в базе."
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-teal-200/60 bg-white shadow-sm ring-1 ring-teal-900/[0.06]">
          <div className="flex flex-col gap-4 border-b border-teal-100 bg-gradient-to-r from-teal-50/80 to-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Каталог (кнопка «Каталог»)</h2>
              <p className="mt-1 text-sm text-gray-600">
                Резервный список: используется на сайте только если в «Категории каталога» нет ни одной записи.
                Иначе порядок и состав левой колонки берутся из раздела «Категории каталога».
              </p>
            </div>
            <button type="button" onClick={() => openModal('catalog_menu_items')} className={addButtonClass}>
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Добавить
            </button>
          </div>
          <div className="p-5 sm:p-6">
            <MenuItemsList
              items={catalogItems}
              onEdit={(item) => openModal('catalog_menu_items', item)}
              onDelete={(id) => handleDelete('catalog_menu_items', id)}
              toggleActive={(item) => toggleActive('catalog_menu_items', item)}
              moveItem={(id, dir) => moveItem('catalog_menu_items', id, dir)}
              emptyTitle="Нет пунктов каталога"
              emptyHint="Добавьте пункты или выполните миграцию БД (таблица catalog_menu_items)."
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-indigo-200/60 bg-white shadow-sm ring-1 ring-indigo-900/[0.06]">
          <div className="flex flex-col gap-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Сетка категорий на главной</h2>
              <p className="mt-1 text-sm text-gray-600">
                Плитки под промо на главной странице (изображение, подпись, slug и при необходимости свой URL).
              </p>
            </div>
            <button type="button" onClick={() => openModal('home_category_grid_items')} className={addButtonClass}>
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Добавить
            </button>
          </div>
          <div className="p-5 sm:p-6">
            <MenuItemsList
              items={homeGridItems}
              onEdit={(item) => openModal('home_category_grid_items', item)}
              onDelete={(id) => handleDelete('home_category_grid_items', id)}
              toggleActive={(item) => toggleActive('home_category_grid_items', item)}
              moveItem={(id, dir) => moveItem('home_category_grid_items', id, dir)}
              emptyTitle="Нет плиток на главной"
              emptyHint="Добавьте записи или выполните миграцию БД (таблица home_category_grid_items)."
            />
          </div>
        </section>
      </div>

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
