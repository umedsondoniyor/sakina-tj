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

const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';

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
      <div className="flex min-h-full items-center justify-center bg-gray-50/50 p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Политика конфиденциальности</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
              Публичная страница{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-teal-600 hover:text-teal-800"
              >
                /privacy
              </a>
              . Текст основного блока задаётся в Markdown (заголовки ##, списки, ссылки).
            </p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Редактировать
            </button>
          )}
        </div>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.04]">
            <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">Заголовок и SEO</h2>
              <p className="mt-1 text-sm text-gray-500">H1 страницы, meta description и вводный абзац под заголовком</p>
            </header>
            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Заголовок страницы (H1)</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.page_title}
                    onChange={(e) => setDraft((d) => ({ ...d, page_title: e.target.value }))}
                    className={inputClass}
                    placeholder="Политика конфиденциальности"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{draft.page_title}</p>
                )}
              </div>

              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Meta description (SEO)</label>
                {isEditing ? (
                  <textarea
                    value={draft.meta_description ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, meta_description: e.target.value }))}
                    rows={2}
                    className={`${inputClass} text-sm`}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-gray-700">
                    {(draft.meta_description ?? '').trim() || (
                      <span className="italic text-gray-400">Не указано</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Вводный абзац (под заголовком)</label>
                {isEditing ? (
                  <textarea
                    value={draft.intro ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value }))}
                    rows={3}
                    className={`${inputClass} text-sm`}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {(draft.intro ?? '').trim() || <span className="italic text-gray-400">Не указано</span>}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-teal-200/80 bg-white shadow-sm ring-1 ring-teal-900/[0.06]">
            <header className="border-b border-teal-100/80 bg-teal-50/60 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">Основной текст</h2>
              <p className="mt-1 text-sm text-gray-600">
                Формат Markdown <span className="text-red-500">*</span> — заголовки ##, списки, ссылки
              </p>
            </header>
            <div className="p-5 sm:p-6">
              {isEditing ? (
                <>
                  <textarea
                    value={draft.body_markdown}
                    onChange={(e) => setDraft((d) => ({ ...d, body_markdown: e.target.value }))}
                    rows={22}
                    spellCheck={false}
                    className={`${inputClass} font-mono text-sm`}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Пример: ## Раздел, списки с «- », ссылки [текст](/contacts) или [телефон](tel:+992905339595).
                  </p>
                </>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">
                  {(draft.body_markdown ?? '').trim() ? draft.body_markdown : (
                    <span className="italic text-gray-400">Текст не задан</span>
                  )}
                </div>
              )}
            </div>
          </section>

          {isEditing && (
            <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:px-6">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <X className="h-4 w-4" aria-hidden />
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" aria-hidden />
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 sm:px-5">
          <p className="text-sm text-teal-900/90">
            <span className="font-semibold text-teal-950">Подсказка:</span> после сохранения откройте{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              страницу политики
            </a>{' '}
            в новой вкладке, чтобы проверить вид для посетителей.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPrivacyPolicy;
