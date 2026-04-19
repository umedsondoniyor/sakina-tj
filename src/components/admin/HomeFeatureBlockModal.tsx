import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { HomeFeatureBlock } from '../../lib/types';
import { LUCIDE_ICON_NAMES, getLucideIconByName } from '../../lib/navigationIcons';

interface HomeFeatureBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: HomeFeatureBlock;
  onSuccess: () => void;
  defaultOrderIndex: number;
}

const HomeFeatureBlockModal: React.FC<HomeFeatureBlockModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  defaultOrderIndex,
}) => {
  const [iconName, setIconName] = useState('Box');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setIconName(item.icon_name || 'Box');
      setTitle(item.title);
      setDescription(item.description);
      setOrderIndex(item.order_index);
      setIsActive(item.is_active);
    } else {
      setIconName('Box');
      setTitle('');
      setDescription('');
      setOrderIndex(defaultOrderIndex);
      setIsActive(true);
    }
  }, [item, isOpen, defaultOrderIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      toast.error('Укажите заголовок и текст');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        icon_name: iconName.trim() || 'Box',
        title: t,
        description: d,
        order_index: orderIndex,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (item?.id) {
        const { error } = await supabase.from('home_feature_blocks').update(payload).eq('id', item.id);
        if (error) throw error;
        toast.success('Блок обновлён');
      } else {
        const { error } = await supabase.from('home_feature_blocks').insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success('Блок добавлен');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Не удалось сохранить');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const PreviewIcon = getLucideIconByName(iconName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Редактировать блок' : 'Новый блок преимуществ'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Иконка Lucide</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                <PreviewIcon size={22} className="text-brand-turquoise" />
              </div>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {LUCIDE_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Текст *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Порядок</label>
            <input
              type="number"
              min={0}
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hf-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="hf-active" className="text-sm text-gray-700">
              Показывать на главной
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy disabled:opacity-50"
            >
              {loading ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeFeatureBlockModal;
