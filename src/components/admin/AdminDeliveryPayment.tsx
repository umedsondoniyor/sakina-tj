import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeliveryPaymentSettings {
  id?: string;
  title: string;
  description: string | null;
  delivery_content: string | null;
  payment_content: string | null;
}

const AdminDeliveryPayment: React.FC = () => {
  const [settings, setSettings] = useState<DeliveryPaymentSettings>({
    title: 'Доставка и оплата',
    description: '',
    delivery_content: '',
    payment_content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_payment_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching delivery/payment settings:', error);
      toast.error('Не удалось загрузить настройки доставки и оплаты');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        updated_at: new Date().toISOString()
      };

      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('delivery_payment_settings')
          .update(payload)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('delivery_payment_settings')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) setSettings({ ...settings, id: data.id });
      }

      toast.success('Настройки доставки и оплаты успешно сохранены');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving delivery/payment settings:', error);
      toast.error('Не удалось сохранить настройки доставки и оплаты');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchSettings();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление страницей доставки и оплаты</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Редактировать
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Доставка и оплата"
              />
            ) : (
              <p className="text-gray-900 font-medium">{settings.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            {isEditing ? (
              <input
                type="text"
                value={settings.description || ''}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Краткое описание"
              />
            ) : (
              <p className="text-gray-600">{settings.description || 'Не указано'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Контент о доставке
            </label>
            {isEditing ? (
              <textarea
                value={settings.delivery_content || ''}
                onChange={(e) => setSettings({ ...settings, delivery_content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Информация о доставке. Можно использовать HTML разметку."
              />
            ) : (
              <div 
                className="text-gray-700 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: settings.delivery_content || 'Контент не указан' }}
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Можно использовать HTML разметку для форматирования текста
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Контент об оплате
            </label>
            {isEditing ? (
              <textarea
                value={settings.payment_content || ''}
                onChange={(e) => setSettings({ ...settings, payment_content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Информация об оплате. Можно использовать HTML разметку."
              />
            ) : (
              <div 
                className="text-gray-700 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: settings.payment_content || 'Контент не указан' }}
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Можно использовать HTML разметку для форматирования текста
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !settings.title}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Примечание:</strong> Изменения будут отображаться на странице{' '}
          <a href="/delivery-payment" target="_blank" className="underline hover:text-blue-600">
            /delivery-payment
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminDeliveryPayment;

