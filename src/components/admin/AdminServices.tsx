import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServicesSettings {
  id?: string;
  title: string;
  description: string | null;
  content: string | null;
}

const AdminServices: React.FC = () => {
  const [settings, setSettings] = useState<ServicesSettings>({
    title: 'Наши услуги',
    description: '',
    content: ''
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
        .from('services_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching services settings:', error);
      toast.error('Не удалось загрузить настройки услуг');
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
          .from('services_settings')
          .update(payload)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('services_settings')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) setSettings({ ...settings, id: data.id });
      }

      toast.success('Настройки услуг успешно сохранены');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving services settings:', error);
      toast.error('Не удалось сохранить настройки услуг');
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
        <h1 className="text-2xl font-bold">Управление страницей услуг</h1>
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
                placeholder="Наши услуги"
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
                placeholder="Краткое описание услуг"
              />
            ) : (
              <p className="text-gray-600">{settings.description || 'Не указано'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Основной контент
            </label>
            {isEditing ? (
              <textarea
                value={settings.content || ''}
                onChange={(e) => setSettings({ ...settings, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Основной текст страницы услуг. Можно использовать HTML разметку."
              />
            ) : (
              <div 
                className="text-gray-700 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: settings.content || 'Контент не указан' }}
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
              className="px-4 py-2 bg-brand-turquoise text-white hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
          <a href="/services" target="_blank" className="underline hover:text-blue-600">
            /services
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminServices;

