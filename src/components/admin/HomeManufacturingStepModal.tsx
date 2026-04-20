import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { HomeManufacturingStep } from '../../lib/types';

const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';

interface HomeManufacturingStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: HomeManufacturingStep;
  onSuccess: () => void;
  defaultOrderIndex: number;
}

const HomeManufacturingStepModal: React.FC<HomeManufacturingStepModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  defaultOrderIndex,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setImageUrl(item.image_url || '');
      setCaption(item.caption);
      setOrderIndex(item.order_index);
      setIsActive(item.is_active);
    } else {
      setImageUrl('');
      setCaption('');
      setOrderIndex(defaultOrderIndex);
      setIsActive(true);
    }
  }, [item, isOpen, defaultOrderIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const img = imageUrl.trim();
    const c = caption.trim();
    if (!img || !c) {
      toast.error('Укажите URL изображения и подпись');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        image_url: img,
        caption: c,
        order_index: orderIndex,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (item?.id) {
        const { error } = await supabase.from('home_manufacturing_steps').update(payload).eq('id', item.id);
        if (error) throw error;
        toast.success('Этап обновлён');
      } else {
        const { error } = await supabase.from('home_manufacturing_steps').insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success('Этап добавлен');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-h-[90vh] max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-gray-900">
            {item ? 'Редактировать этап' : 'Новый этап'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div>
            <label className={`mb-2 block ${fieldLabelClass}`}>URL изображения *</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://… или /images/…"
              className={`${inputClass} font-mono text-sm`}
              required
            />
          </div>

          <div>
            <label className={`mb-2 block ${fieldLabelClass}`}>Подпись *</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={`mb-2 block ${fieldLabelClass}`}>Порядок</label>
            <input
              type="number"
              min={0}
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
              className={inputClass}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5">
            <input
              type="checkbox"
              id="ms-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Показывать на главной</span>
          </label>

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeManufacturingStepModal;
