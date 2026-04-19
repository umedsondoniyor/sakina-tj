import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { FaqItem } from '../../lib/types';

interface FaqItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: FaqItem;
  onSuccess: () => void;
  defaultOrderIndex: number;
}

const FaqItemModal: React.FC<FaqItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  defaultOrderIndex,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setQuestion(item.question);
      setAnswer(item.answer);
      setOrderIndex(item.order_index);
      setIsActive(item.is_active);
    } else {
      setQuestion('');
      setAnswer('');
      setOrderIndex(defaultOrderIndex);
      setIsActive(true);
    }
  }, [item, isOpen, defaultOrderIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    const a = answer.trim();
    if (!q || !a) {
      toast.error('Заполните вопрос и ответ');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        question: q,
        answer: a,
        order_index: orderIndex,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (item?.id) {
        const { error } = await supabase.from('faq_items').update(payload).eq('id', item.id);
        if (error) throw error;
        toast.success('Вопрос обновлён');
      } else {
        const { error } = await supabase.from('faq_items').insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success('Вопрос добавлен');
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
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Редактировать вопрос' : 'Новый вопрос'}
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
            <label htmlFor="faq-question" className="block text-sm font-medium text-gray-700 mb-1">
              Вопрос
            </label>
            <textarea
              id="faq-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="faq-answer" className="block text-sm font-medium text-gray-700 mb-1">
              Ответ
            </label>
            <textarea
              id="faq-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <label htmlFor="faq-order" className="block text-sm font-medium text-gray-700 mb-1">
                Порядок
              </label>
              <input
                id="faq-order"
                type="number"
                min={0}
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Показывать на сайте</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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

export default FaqItemModal;
