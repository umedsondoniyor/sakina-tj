import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { HomeBenefitBlock } from '../../lib/types';

interface HomeBenefitBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: HomeBenefitBlock;
  onSuccess: () => void;
  defaultOrderIndex: number;
}

const HomeBenefitBlockModal: React.FC<HomeBenefitBlockModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  defaultOrderIndex,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setImageUrl(item.image_url || '');
      setTitle(item.title);
      setSubtitle(item.subtitle);
      setBody(item.body);
      setLinkUrl(item.link_url ?? '');
      setOrderIndex(item.order_index);
      setIsActive(item.is_active);
    } else {
      setImageUrl('');
      setTitle('');
      setSubtitle('');
      setBody('');
      setLinkUrl('');
      setOrderIndex(defaultOrderIndex);
      setIsActive(true);
    }
  }, [item, isOpen, defaultOrderIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const img = imageUrl.trim();
    const t = title.trim();
    const st = subtitle.trim();
    const b = body.trim();
    if (!img || !t || !st || !b) {
      toast.error('Укажите URL картинки, заголовок, подзаголовок и текст');
      return;
    }

    setLoading(true);
    try {
      const linkTrim = linkUrl.trim();
      const payload = {
        image_url: img,
        title: t,
        subtitle: st,
        body: b,
        link_url: linkTrim.length > 0 ? linkTrim : null,
        order_index: orderIndex,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (item?.id) {
        const { error } = await supabase.from('home_benefit_blocks').update(payload).eq('id', item.id);
        if (error) throw error;
        toast.success('Карточка обновлена');
      } else {
        const { error } = await supabase.from('home_benefit_blocks').insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success('Карточка добавлена');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Редактировать карточку' : 'Новая карточка преимуществ'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">URL изображения *</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://… или /images/…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Публичный адрес или путь из папки `public`.</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок *</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Текст (всплывающее описание) *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка «Подробнее» (необязательно)</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Оставьте пустым, чтобы скрыть кнопку"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
              id="hb-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="hb-active" className="text-sm text-gray-700">
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

export default HomeBenefitBlockModal;
