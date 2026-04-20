import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import type { SeoPageSetting } from '../../lib/types';
import { HOME_SEO_FALLBACK, parseExtraMetaJson, formatExtraMetaForEditor } from '../../lib/seo';

type Draft = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  extra_meta_json: string;
};

const emptyDraft = (): Draft => ({
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  extra_meta_json: '',
});

/** Same as migration `20260419330000_seo_sample_extra_meta.sql` — use to test Helmet + build-time index.html. */
const SAMPLE_EXTRA_META_JSON = `[
  { "property": "og:image", "content": "https://sakina.tj/og/cover-1200x630.jpg" },
  { "name": "twitter:card", "content": "summary_large_image" },
  { "name": "twitter:image", "content": "https://sakina.tj/og/cover-1200x630.jpg" }
]`;

const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';
const inputMonoClass = `${inputClass} font-mono text-sm`;

const code = (children: ReactNode) => (
  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.7rem] font-mono text-gray-800">{children}</code>
);

type SeoEditorBlockProps = {
  variant: 'default' | 'home';
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  updatedAt?: string | null;
  keywordsFooter?: ReactNode;
  extraMetaFooter?: ReactNode;
};

const SeoEditorBlock = ({ variant, draft, setDraft, updatedAt, keywordsFooter, extraMetaFooter }: SeoEditorBlockProps) => (
  <div className="space-y-6 p-5 sm:p-6">
    <div>
      <label className={`mb-2 block ${fieldLabelClass}`}>
        Meta title <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={draft.meta_title}
        onChange={(e) => setDraft((d) => ({ ...d, meta_title: e.target.value }))}
        className={inputClass}
      />
      <p className="mt-1.5 text-xs text-gray-400">{draft.meta_title.length} символов</p>
    </div>
    <div>
      <label className={`mb-2 block ${fieldLabelClass}`}>Meta description</label>
      <textarea
        value={draft.meta_description}
        onChange={(e) => setDraft((d) => ({ ...d, meta_description: e.target.value }))}
        rows={3}
        className={inputClass}
      />
      <p className="mt-1.5 text-xs text-gray-400">{draft.meta_description.length} символов</p>
    </div>
    <div>
      <label className={`mb-2 block ${fieldLabelClass}`}>Meta keywords</label>
      <input
        type="text"
        value={draft.meta_keywords}
        onChange={(e) => setDraft((d) => ({ ...d, meta_keywords: e.target.value }))}
        placeholder={variant === 'home' ? 'через запятую; пусто — из «По умолчанию»' : 'через запятую'}
        className={inputClass}
      />
      {keywordsFooter}
    </div>
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className={fieldLabelClass}>Дополнительные meta-теги (JSON)</label>
        <button
          type="button"
          onClick={() => setDraft((d) => ({ ...d, extra_meta_json: SAMPLE_EXTRA_META_JSON }))}
          className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-900 hover:underline"
        >
          Подставить пример
        </button>
      </div>
      <textarea
        value={draft.extra_meta_json}
        onChange={(e) => setDraft((d) => ({ ...d, extra_meta_json: e.target.value }))}
        rows={8}
        spellCheck={false}
        placeholder={SAMPLE_EXTRA_META_JSON}
        className={inputMonoClass}
      />
      {extraMetaFooter}
    </div>
    {updatedAt ? (
      <p className="text-xs text-gray-400">Обновлено: {new Date(updatedAt).toLocaleString('ru-RU')}</p>
    ) : null}
  </div>
);

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
        meta_keywords: def?.meta_keywords ?? HOME_SEO_FALLBACK.keywords,
        extra_meta_json: formatExtraMetaForEditor(def?.extra_meta),
      });
      setHomeDraft({
        meta_title: home?.meta_title ?? HOME_SEO_FALLBACK.title,
        meta_description: home?.meta_description ?? HOME_SEO_FALLBACK.description,
        meta_keywords: home?.meta_keywords ?? HOME_SEO_FALLBACK.keywords,
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
    const meta_keywords = draft.meta_keywords.trim() || null;
    const now = new Date().toISOString();

    const { error } = await supabase.from('seo_page_settings').upsert(
      {
        route_key: routeKey,
        meta_title,
        meta_description,
        meta_keywords,
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
      <div className="flex min-h-full items-center justify-center bg-gray-50/50 p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">SEO</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            Заголовок и описание для поисковых систем. «По умолчанию» — запасной вариант; «Главная» — для страницы{' '}
            <span className="font-medium text-gray-800">/</span>. Если поле главной пустое в базе, подставляется значение по
            умолчанию. Тот же набор правил подставляет мета-теги в корневой {code('index.html')} при {code('vite build')} и при
            запуске dev (нужны {code('VITE_SUPABASE_*')}); после смены SEO пересоберите продакшен, чтобы статический HTML совпадал с
            базой.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">По умолчанию (fallback)</h2>
            <p className="mt-1 text-sm text-gray-500">
              Используется для главной, если для неё не задано отдельное описание, и как база для будущих страниц.
            </p>
          </header>
          <SeoEditorBlock
            variant="default"
            draft={defaultDraft}
            setDraft={setDefaultDraft}
            updatedAt={defaultRow?.updated_at}
            keywordsFooter={
              <p className="mt-1.5 text-xs text-gray-500">
                Тег {code('meta name="keywords"')} для главной (редко влияет на ранжирование). Пустое значение на главной — взять
                из блока «По умолчанию».
              </p>
            }
            extraMetaFooter={
              <p className="mt-1.5 text-xs text-gray-500">
                Массив объектов с полями {code('name')} или {code('property')} и обязательным {code('content')}. Пустое поле —
                без доп. тегов.
              </p>
            }
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-teal-200/70 bg-white shadow-sm ring-1 ring-teal-900/[0.06]">
          <header className="border-b border-teal-100/90 bg-gradient-to-r from-teal-50/70 to-white px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">Главная страница (/)</h2>
            <p className="mt-1 text-sm text-gray-600">
              Отдельные title и description только для главной. Пустое поле описания здесь означает «взять из блока по умолчанию»
              после сохранения (оставьте текст, если нужна своя формулировка).
            </p>
          </header>
          <SeoEditorBlock
            variant="home"
            draft={homeDraft}
            setDraft={setHomeDraft}
            updatedAt={homeRow?.updated_at}
            extraMetaFooter={
              <p className="mt-1.5 text-xs text-gray-500">
                Если массив не пустой — используется для главной; иначе подставляются теги из блока «По умолчанию».
              </p>
            }
          />
        </section>

        <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4 shrink-0" aria-hidden />
            {saving ? 'Сохранение…' : 'Сохранить всё'}
          </button>
        </div>

        <div className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 sm:px-5">
          <p className="text-sm text-teal-900/90">
            <span className="font-semibold text-teal-950">Подсказка:</span> после изменения SEO выполните{' '}
            {code('npm run build')} для продакшена, чтобы предрендер в {code('index.html')} совпадал с данными из базы.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSeo;
