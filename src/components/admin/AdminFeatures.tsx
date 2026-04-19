import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import HomeFeatureBlockModal from './HomeFeatureBlockModal';
import type { HomeFeatureBlock } from '../../lib/types';
import { getLucideIconByName } from '../../lib/navigationIcons';

const AdminFeatures = () => {
  const [items, setItems] = useState<HomeFeatureBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HomeFeatureBlock | undefined>();

  const fetchItems = async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('home_feature_blocks')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching home feature blocks:', error);
      toast.error('Не удалось загрузить блоки');
    } finally {
      if (!opts?.quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот блок?')) return;

    try {
      const { error } = await supabase.from('home_feature_blocks').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter((i) => i.id !== id));
      toast.success('Блок удалён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось удалить');
    }
  };

  const toggleActive = async (row: HomeFeatureBlock) => {
    try {
      const { error } = await supabase
        .from('home_feature_blocks')
        .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
        .eq('id', row.id);

      if (error) throw error;
      setItems(
        items.map((i) => (i.id === row.id ? { ...i, is_active: !i.is_active } : i)),
      );
      toast.success(row.is_active ? 'Скрыто на сайте' : 'Показано на сайте');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось обновить статус');
    }
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;

    try {
      const a = items[idx];
      const b = items[newIdx];
      await Promise.all([
        supabase.from('home_feature_blocks').update({ order_index: b.order_index }).eq('id', a.id),
        supabase.from('home_feature_blocks').update({ order_index: a.order_index }).eq('id', b.id),
      ]);
      await fetchItems({ quiet: true });
      toast.success('Порядок обновлён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось изменить порядок');
    }
  };

  const handleEdit = (row: HomeFeatureBlock) => {
    setSelectedItem(row);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const defaultOrderIndex =
    items.length > 0 ? Math.max(...items.map((i) => i.order_index)) + 1 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
          <span className="text-gray-600">Загрузка…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Преимущества (главная)</h1>
          <p className="text-sm text-gray-600 mt-1">
            Блоки под заголовком «Преимущества» на главной странице.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить блок
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Пока нет блоков</h3>
          <p className="mt-1 text-sm text-gray-500">Добавьте блоки или выполните миграцию БД.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((row, index) => {
            const Icon = getLucideIconByName(row.icon_name);
            return (
              <div
                key={row.id}
                className="bg-white rounded-lg shadow border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center shrink-0 bg-gray-50">
                  <Icon size={22} className="text-brand-turquoise" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">{row.icon_name}</p>
                  <p className="font-semibold text-gray-900">{row.title}</p>
                  <p className="text-sm text-gray-600 mt-2">{row.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>Порядок: {row.order_index}</span>
                    <button
                      type="button"
                      onClick={() => toggleActive(row)}
                      className={`px-2 py-0.5 rounded font-medium ${
                        row.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {row.is_active ? 'На сайте' : 'Скрыто'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => moveItem(row.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      aria-label="Выше"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(row.id, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      aria-label="Ниже"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded"
                    aria-label="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    aria-label="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HomeFeatureBlockModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(undefined);
        }}
        item={selectedItem}
        defaultOrderIndex={defaultOrderIndex}
        onSuccess={fetchItems}
      />
    </div>
  );
};

export default AdminFeatures;
