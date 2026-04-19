import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import type { SeoPageSetting } from '../../lib/types';
import { HOME_SEO_FALLBACK, parseExtraMetaJson, formatExtraMetaForEditor } from '../../lib/seo';

type Draft = { meta_title: string; meta_description: string; extra_meta_json: string };

const emptyDraft = (): Draft => ({ meta_title: '', meta_description: '', extra_meta_json: '' });

const AdminSeo = () => {
  const [defaultRow, setDefaultRow] = useState<SeoPageSetting | null>(null);
  const [homeRow, setHomeRow] = useState<SeoPageSetting | null>(null);
  const [defaultDraft, setDefaultDraft] = useState<Draft>(emptyDraft);
  const [homeDraft, setHomeDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_page_settings')
        .select('*')
        .in('route_key', ['default', 'home']);

      if (error) throw error;

      const rows = (data ?? []) as SeoPageSetting[];
      const byKey = Object.fromEntries(rows.map((r) => [r.route_key, r]));
      const def = byKey['default'] ?? null;
      const home = byKey['home'] ?? null;

      setDefaultRow(def);
      setHomeRow(home);
      setDefaultDraft({
        meta_title: def?.meta_title ?? HOME_SEO_FALLBACK.title,
        meta_description: def?.meta_description ?? HOME_SEO_FALLBACK.description,
        extra_meta_json: formatExtraMetaForEditor(def?.extra_meta),
      });
      setHomeDraft({
        meta_title: home?.meta_title ?? HOME_SEO_FALLBACK.title,
        meta_description: home?.meta_description ?? HOME_SEO_FALLBACK.description,
        extra_meta_json: formatExtraMetaForEditor(home?.extra_meta),
      });
    } catch (e) {
      console.error(e);
      toast.error('Не удалось загрузить SEO');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upsert = async (routeKey: 'default' | 'home', draft: Draft) => {
    const meta_title = draft.meta_title.trim();
    if (!meta_title) {
      toast.error('Укажите заголовок (title)');
      return false;
    }
    const parsed = parseExtraMetaJson(draft.extra_meta_json);
    if (!parsed.ok) {
      toast.error(
        routeKey === 'default'
          ? `По умолчанию — доп. meta: ${parsed.error}`
          : `Главная — доп. meta: ${parsed.error}`,
      );
      return false;
    }
    const meta_description = draft.meta_description.trim() || null;
    const now = new Date().toISOString();

    const { error } = await supabase.from('seo_page_settings').upsert(
      {
        route_key: routeKey,
        meta_title,
        meta_description,
        extra_meta: parsed.value,
        updated_at: now,
      },
      { onConflict: 'route_key' },
    );

    if (error) throw error;
    return true;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const okDefault = await upsert('default', defaultDraft);
      if (!okDefault) return;
      const okHome = await upsert('home', homeDraft);
      if (!okHome) return;
      toast.success('SEO сохранён');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO</h1>
        <p className="mt-1 text-sm text-gray-600">
          Заголовок и описание для поисковых систем. «По умолчанию» — запасной вариант; «Главная» — для
          страницы «/». Если поле главной пустое в базе, подставляется значение по умолчанию.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">По умолчанию (fallback)</h2>
        <p className="text-sm text-gray-500">
          Используется для главной, если для неё не задано отдельное описание, и как база для будущих
          страниц.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={defaultDraft.meta_title}
            onChange={(e) => setDefaultDraft((d) => ({ ...d, meta_title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="mt-1 text-xs text-gray-400">{defaultDraft.meta_title.length} символов</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta description</label>
          <textarea
            value={defaultDraft.meta_description}
            onChange={(e) => setDefaultDraft((d) => ({ ...d, meta_description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="mt-1 text-xs text-gray-400">{defaultDraft.meta_description.length} символов</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дополнительные meta-теги (JSON)
          </label>
          <textarea
            value={defaultDraft.extra_meta_json}
            onChange={(e) => setDefaultDraft((d) => ({ ...d, extra_meta_json: e.target.value }))}
            rows={6}
            spellCheck={false}
            placeholder={`[\n  { "property": "og:image", "content": "https://example.com/image.jpg" },\n  { "name": "twitter:card", "content": "summary_large_image" }\n]`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Массив объектов с полями <code className="text-xs">name</code> или{' '}
            <code className="text-xs">property</code> и обязательным <code className="text-xs">content</code>.
            Пустое поле — без доп. тегов.
          </p>
        </div>
        {defaultRow?.updated_at ? (
          <p className="text-xs text-gray-400">
            Обновлено: {new Date(defaultRow.updated_at).toLocaleString('ru-RU')}
          </p>
        ) : null}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Главная страница (/)</h2>
        <p className="text-sm text-gray-500">
          Отдельные title и description только для главной. Пустое поле описания здесь означает «взять из
          блока по умолчанию» после сохранения (оставьте текст, если нужна своя формулировка).
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={homeDraft.meta_title}
            onChange={(e) => setHomeDraft((d) => ({ ...d, meta_title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="mt-1 text-xs text-gray-400">{homeDraft.meta_title.length} символов</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta description</label>
          <textarea
            value={homeDraft.meta_description}
            onChange={(e) => setHomeDraft((d) => ({ ...d, meta_description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="mt-1 text-xs text-gray-400">{homeDraft.meta_description.length} символов</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дополнительные meta-теги (JSON)
          </label>
          <textarea
            value={homeDraft.extra_meta_json}
            onChange={(e) => setHomeDraft((d) => ({ ...d, extra_meta_json: e.target.value }))}
            rows={6}
            spellCheck={false}
            placeholder={`[\n  { "property": "og:image", "content": "https://…" }\n]`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Если массив не пустой — используется для главной; иначе подставляются теги из блока «По умолчанию».
          </p>
        </div>
        {homeRow?.updated_at ? (
          <p className="text-xs text-gray-400">
            Обновлено: {new Date(homeRow.updated_at).toLocaleString('ru-RU')}
          </p>
        ) : null}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-turquoise text-white font-medium hover:bg-brand-navy disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
};

export default AdminSeo;
