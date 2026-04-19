import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { PrivacyPolicySettings } from '../../lib/types';

const emptyState: Omit<PrivacyPolicySettings, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
} = {
  page_title: 'Политика конфиденциальности',
  meta_description: '',
  intro: '',
  body_markdown: '',
};

const AdminPrivacyPolicy: React.FC = () => {
  const [settings, setSettings] = useState<PrivacyPolicySettings | null>(null);
  const [draft, setDraft] = useState<typeof emptyState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('privacy_policy_settings').select('*').limit(1).maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as PrivacyPolicySettings);
        setDraft({
          id: data.id,
          page_title: data.page_title,
          meta_description: data.meta_description ?? '',
          intro: data.intro ?? '',
          body_markdown: data.body_markdown,
        });
      } else {
        setSettings(null);
        setDraft(emptyState);
      }
    } catch (error) {
      console.error('Error fetching privacy policy settings:', error);
      toast.error('Не удалось загрузить настройки страницы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const title = draft.page_title.trim();
    const body = draft.body_markdown.trim();
    if (!title || !body) {
      toast.error('Укажите заголовок и тело страницы (Markdown)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        page_title: title,
        meta_description: draft.meta_description?.trim() || null,
        intro: draft.intro?.trim() || null,
        body_markdown: body,
        updated_at: new Date().toISOString(),
      };

      if (draft.id) {
        const { error } = await supabase.from('privacy_policy_settings').update(payload).eq('id', draft.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('privacy_policy_settings')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setDraft((d) => ({ ...d, id: data.id }));
        }
      }

      toast.success('Политика конфиденциальности сохранена');
      setIsEditing(false);
      await fetchSettings();
    } catch (error) {
      console.error('Error saving privacy policy:', error);
      toast.error('Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setDraft({
        id: settings.id,
        page_title: settings.page_title,
        meta_description: settings.meta_description ?? '',
        intro: settings.intro ?? '',
        body_markdown: settings.body_markdown,
      });
    } else {
      setDraft(emptyState);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Политика конфиденциальности</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Редактировать
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Публичная страница:{' '}
        <a href="/privacy" className="text-teal-600 underline" target="_blank" rel="noreferrer">
          /privacy
        </a>
        . Текст основного блока — в формате Markdown (заголовки ##, списки, ссылки).
      </p>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок страницы (H1)</label>
          <input
            type="text"
            value={draft.page_title}
            onChange={(e) => setDraft((d) => ({ ...d, page_title: e.target.value }))}
            disabled={!isEditing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta description (SEO)</label>
          <textarea
            value={draft.meta_description ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, meta_description: e.target.value }))}
            disabled={!isEditing}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Вводный абзац (под заголовком)</label>
          <textarea
            value={draft.intro ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value }))}
            disabled={!isEditing}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Основной текст (Markdown) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={draft.body_markdown}
            onChange={(e) => setDraft((d) => ({ ...d, body_markdown: e.target.value }))}
            disabled={!isEditing}
            rows={22}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm disabled:bg-gray-50"
            spellCheck={false}
          />
          <p className="text-xs text-gray-500 mt-2">
            Пример: ## Раздел, списки с «- », ссылки [текст](/contacts) или [телефон](tel:+992905339595).
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPrivacyPolicy;
