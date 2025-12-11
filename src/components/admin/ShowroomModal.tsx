import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { Showroom } from './AdminShowrooms';

interface ShowroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  showroom?: Showroom;
  onSuccess: () => void;
}

const ShowroomModal: React.FC<ShowroomModalProps> = ({ isOpen, onClose, showroom, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    map_link: '',
    phone: '',
    order_index: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showroom) {
      setFormData({
        name: showroom.name,
        address: showroom.address,
        map_link: showroom.map_link,
        phone: showroom.phone || '',
        order_index: showroom.order_index,
        is_active: showroom.is_active
      });
    } else {
      setFormData({
        name: '',
        address: '',
        map_link: '',
        phone: '',
        order_index: 0,
        is_active: true
      });
    }
  }, [showroom, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.map_link) {
        throw new Error('Название, адрес и ссылка на карту обязательны для заполнения');
      }

      const showroomData = {
        ...formData,
        phone: formData.phone || null,
        updated_at: new Date().toISOString()
      };

      if (showroom?.id) {
        // Update existing showroom
        const { error } = await supabase
          .from('showrooms')
          .update(showroomData)
          .eq('id', showroom.id);

        if (error) throw error;
        toast.success('Шоурум успешно обновлен');
      } else {
        // Create new showroom
        const { error } = await supabase
          .from('showrooms')
          .insert([{
            ...showroomData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success('Шоурум успешно создан');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving showroom:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить шоурум';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {showroom ? 'Редактировать шоурум' : 'Добавить новый шоурум'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название шоурума *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Душанбе, Пулоди 4"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Например: Душанбе, Пулоди 4"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ссылка на карту (Google Maps) *
              </label>
              <input
                type="url"
                required
                value={formData.map_link}
                onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Вставьте ссылку на Google Maps или другой картографический сервис
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон (необязательно)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+992 90 123 4567"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок отображения
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Активен
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-turquoise text-white hover:bg-brand-navy disabled:bg-gray-400"
            >
              {loading ? 'Сохранение...' : showroom ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowroomModal;

