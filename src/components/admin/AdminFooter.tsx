import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Save, Plus, Trash2, ChevronUp, ChevronDown, X, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { FooterSiteSettings, FooterSectionRecord, FooterSectionLinkRecord } from '../../lib/types';

type SectionRow = FooterSectionRecord & {
  footer_section_links: FooterSectionLinkRecord[];
};

const SECTION_TYPES: { value: FooterSectionRecord['section_type']; label: string; hint: string }[] = [
  { value: 'manual', label: 'Вручную', hint: 'Ссылки задаются ниже' },
  { value: 'categories', label: 'Категории', hint: 'Автоматически из каталога' },
  { value: 'blog', label: 'Блог', hint: 'Статьи блога + «Все статьи»' },
];

const emptySettings: FooterSiteSettings = {
  id: '',
  phone_display: '',
  phone_href: '',
  email: '',
  email_href: '',
  address: '',
  copyright_line1: '',
  copyright_line2: '',
  legal_text: '',
  payment_label: '',
  show_payment_icons: true,
  social_heading: '',
  instagram_url: '',
  created_at: '',
  updated_at: '',
};

const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';
const inputMonoClass = `${inputClass} font-mono text-sm`;
const addButtonClass =
  'inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 shrink-0';
const subSectionTitleClass = 'text-sm font-semibold text-gray-900';

const AdminFooter: React.FC = () => {
  const [settings, setSettings] = useState<FooterSiteSettings>(emptySettings);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionRow | null>(null);
  const [isNewSection, setIsNewSection] = useState(false);
  const [linkDrafts, setLinkDrafts] = useState<Partial<FooterSectionLinkRecord>[]>([]);

  const loadAll = useCallback(async () => {
    try {
      const { data: s, error: sErr } = await supabase.from('footer_settings').select('*').limit(1).maybeSingle();
      if (sErr) throw sErr;
      if (s) setSettings(s as FooterSiteSettings);

      const { data: sec, error: secErr } = await supabase
        .from('footer_sections')
        .select('*, footer_section_links(*)')
        .order('sort_order', { ascending: true });

      if (secErr) throw secErr;

      const normalized = (sec ?? []).map((row: any) => ({
        ...row,
        title_href: row.title_href ?? null,
        footer_section_links: (row.footer_section_links ?? []).sort(
          (a: FooterSectionLinkRecord, b: FooterSectionLinkRecord) => a.sort_order - b.sort_order,
        ),
      })) as SectionRow[];

      setSections(normalized);
    } catch (e) {
      console.error(e);
      toast.error('Не удалось загрузить данные подвала');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        ...settings,
        updated_at: new Date().toISOString(),
      };
      if (settings.id) {
        const { error } = await supabase.from('footer_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('footer_settings')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        if (data) setSettings(data as FooterSiteSettings);
      }
      toast.success('Настройки подвала сохранены');
    } catch (e) {
      console.error(e);
      toast.error('Ошибка сохранения');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;
    const title = editingSection.title.trim();
    const slug = editingSection.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!title || !slug) {
      toast.error('Укажите название и slug (латиница, цифры, дефис)');
      return;
    }

    try {
      const payload = {
        title,
        slug,
        title_href: editingSection.title_href?.trim() || null,
        section_type: editingSection.section_type,
        sort_order: editingSection.sort_order,
        is_active: editingSection.is_active,
        updated_at: new Date().toISOString(),
      };

      if (isNewSection) {
        const { error } = await supabase.from('footer_sections').insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success('Колонка добавлена');
      } else {
        const { error } = await supabase.from('footer_sections').update(payload).eq('id', editingSection.id);
        if (error) throw error;
        toast.success('Колонка обновлена');
      }

      setEditingSection(null);
      setIsNewSection(false);
      setLinkDrafts([]);
      await loadAll();
    } catch (e: unknown) {
      console.error(e);
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : '';
      toast.error(msg.includes('unique') ? 'Такой slug уже занят' : 'Не удалось сохранить');
    }
  };

  const saveManualLinks = async () => {
    if (!editingSection?.id || editingSection.section_type !== 'manual') return;
    const sectionId = editingSection.id;

    try {
      for (let i = 0; i < linkDrafts.length; i++) {
        const d = linkDrafts[i];
        const label = (d.label ?? '').trim();
        const href = (d.href ?? '').trim();
        if (!label || !href) continue;

        const row = {
          label,
          href,
          sort_order: i,
          is_active: d.is_active !== false,
          updated_at: new Date().toISOString(),
        };

        if (d.id) {
          const { error } = await supabase.from('footer_section_links').update(row).eq('id', d.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('footer_section_links').insert({
            ...row,
            section_id: sectionId,
            created_at: new Date().toISOString(),
          });
          if (error) throw error;
        }
      }

      const keepIds = new Set(linkDrafts.map((d) => d.id).filter(Boolean) as string[]);
      const existing = editingSection.footer_section_links.map((l) => l.id);
      for (const id of existing) {
        if (!keepIds.has(id)) {
          const { error } = await supabase.from('footer_section_links').delete().eq('id', id);
          if (error) throw error;
        }
      }

      toast.success('Ссылки сохранены');
      setEditingSection(null);
      setLinkDrafts([]);
      await loadAll();
    } catch (e) {
      console.error(e);
      toast.error('Не удалось сохранить ссылки');
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Удалить колонку и все её ссылки?')) return;
    try {
      const { error } = await supabase.from('footer_sections').delete().eq('id', id);
      if (error) throw error;
      toast.success('Удалено');
      await loadAll();
    } catch (e) {
      console.error(e);
      toast.error('Не удалось удалить');
    }
  };

  const moveSection = async (id: string, dir: 'up' | 'down') => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const j = dir === 'up' ? idx - 1 : idx + 1;
    if (j < 0 || j >= sections.length) return;
    const a = sections[idx];
    const b = sections[j];
    try {
      await Promise.all([
        supabase.from('footer_sections').update({ sort_order: b.sort_order }).eq('id', a.id),
        supabase.from('footer_sections').update({ sort_order: a.sort_order }).eq('id', b.id),
      ]);
      await loadAll();
      toast.success('Порядок обновлён');
    } catch (e) {
      console.error(e);
      toast.error('Не удалось изменить порядок');
    }
  };

  const toggleSectionActive = async (row: SectionRow) => {
    try {
      const { error } = await supabase
        .from('footer_sections')
        .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
        .eq('id', row.id);
      if (error) throw error;
      await loadAll();
    } catch (e) {
      console.error(e);
      toast.error('Не удалось обновить');
    }
  };

  const openEditSection = (row: SectionRow | null, isNew: boolean) => {
    if (isNew) {
      const maxOrder = sections.length ? Math.max(...sections.map((s) => s.sort_order)) + 1 : 0;
      setEditingSection({
        id: '',
        slug: '',
        title: '',
        title_href: null,
        sort_order: maxOrder,
        section_type: 'manual',
        is_active: true,
        created_at: '',
        updated_at: '',
        footer_section_links: [],
      } as SectionRow);
      setLinkDrafts([]);
      setIsNewSection(true);
    } else if (row) {
      setEditingSection({ ...row });
      setLinkDrafts(
        row.footer_section_links.map((l) => ({
          id: l.id,
          label: l.label,
          href: l.href,
          sort_order: l.sort_order,
          is_active: l.is_active,
          section_id: l.section_id,
        })),
      );
      setIsNewSection(false);
    }
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
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Подвал сайта</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
            Контакты, юридический блок и колонки ссылок внизу каждой страницы — те же данные, что видят посетители.
          </p>
        </div>

        {/* Контакты и нижний блок */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">Контакты и нижний блок</h2>
            <p className="mt-1 text-sm text-gray-500">
              Телефон, email, адрес, копирайт, юридический текст, подпись к оплате и соцсети.
            </p>
          </header>

          <div className="space-y-8 p-5 sm:p-6">
            <div className="space-y-4">
              <h3 className={subSectionTitleClass}>Телефон и email</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={`mb-2 block ${fieldLabelClass}`}>Телефон (текст)</label>
                  <input
                    className={inputClass}
                    value={settings.phone_display}
                    onChange={(e) => setSettings((s) => ({ ...s, phone_display: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={`mb-2 block ${fieldLabelClass}`}>Телефон (href)</label>
                  <input
                    className={inputMonoClass}
                    value={settings.phone_href}
                    onChange={(e) => setSettings((s) => ({ ...s, phone_href: e.target.value }))}
                    placeholder="tel:+992..."
                  />
                </div>
                <div>
                  <label className={`mb-2 block ${fieldLabelClass}`}>Email</label>
                  <input
                    className={inputClass}
                    value={settings.email}
                    onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={`mb-2 block ${fieldLabelClass}`}>Email (href)</label>
                  <input
                    className={inputMonoClass}
                    value={settings.email_href}
                    onChange={(e) => setSettings((s) => ({ ...s, email_href: e.target.value }))}
                    placeholder="mailto:..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-8">
              <h3 className={subSectionTitleClass}>Адрес и копирайт</h3>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Адрес</label>
                <input
                  className={inputClass}
                  value={settings.address}
                  onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>
                  Копирайт (строка 1, {'{year}'} — год)
                </label>
                <input
                  className={inputClass}
                  value={settings.copyright_line1}
                  onChange={(e) => setSettings((s) => ({ ...s, copyright_line1: e.target.value }))}
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Копирайт (строка 2)</label>
                <input
                  className={inputClass}
                  value={settings.copyright_line2 ?? ''}
                  onChange={(e) => setSettings((s) => ({ ...s, copyright_line2: e.target.value }))}
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Юридический текст (внизу)</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={settings.legal_text ?? ''}
                  onChange={(e) => setSettings((s) => ({ ...s, legal_text: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-8">
              <h3 className={subSectionTitleClass}>Оплата и соцсети</h3>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label className={`mb-2 block ${fieldLabelClass}`}>Подпись к способам оплаты</label>
                  <input
                    className={inputClass}
                    value={settings.payment_label}
                    onChange={(e) => setSettings((s) => ({ ...s, payment_label: e.target.value }))}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 sm:shrink-0">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    checked={settings.show_payment_icons}
                    onChange={(e) => setSettings((s) => ({ ...s, show_payment_icons: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-700">Показывать иконки Visa / Mastercard</span>
                </label>
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Заголовок соцсетей</label>
                <input
                  className={inputClass}
                  value={settings.social_heading}
                  onChange={(e) => setSettings((s) => ({ ...s, social_heading: e.target.value }))}
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Ссылка Instagram</label>
                <input
                  className={inputMonoClass}
                  value={settings.instagram_url ?? ''}
                  onChange={(e) => setSettings((s) => ({ ...s, instagram_url: e.target.value }))}
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={saveSettings}
                disabled={savingSettings}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4 shrink-0" aria-hidden />
                {savingSettings ? 'Сохранение…' : 'Сохранить контакты и нижний блок'}
              </button>
            </div>
          </div>
        </section>

        {/* Колонки ссылок */}
        <section className="overflow-hidden rounded-xl border border-teal-200/70 bg-white shadow-sm ring-1 ring-teal-900/[0.06]">
          <div className="flex flex-col gap-4 border-b border-teal-100/90 bg-gradient-to-r from-teal-50/70 to-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Колонки ссылок</h2>
              <p className="mt-1 text-sm text-gray-600">Заголовки колонок и ссылки в подвале (порядок можно менять).</p>
            </div>
            <button type="button" onClick={() => openEditSection(null, true)} className={addButtonClass}>
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Добавить колонку
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {sections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-12 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-gray-400" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold text-gray-900">Колонок пока нет</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                  Добавьте первую колонку или проверьте данные в базе (таблица footer_sections).
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {sections.map((row, index) => (
                  <li
                    key={row.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-shadow hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-gray-900">{row.title}</p>
                          <button
                            type="button"
                            onClick={() => toggleSectionActive(row)}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              row.is_active
                                ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80 hover:bg-emerald-200/80'
                                : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {row.is_active ? 'Активна' : 'Скрыта'}
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500">
                          <span className="font-medium text-gray-600">slug:</span> {row.slug}
                          <span className="mx-2 text-gray-300">·</span>
                          {SECTION_TYPES.find((t) => t.value === row.section_type)?.label ?? row.section_type}
                          {!row.is_active ? ' · скрыта на сайте' : ''}
                        </p>
                        {row.section_type === 'manual' &&
                          (row.footer_section_links.length === 0 && row.title_href ? (
                            <p className="mt-2 text-xs text-gray-600">
                              Только заголовок → <span className="font-mono text-gray-700">{row.title_href}</span>
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-gray-600">
                              {row.footer_section_links.length} ссылок
                            </p>
                          ))}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:border-l sm:border-gray-100 sm:pl-4">
                        <div className="inline-flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => moveSection(row.id, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-500 transition-colors hover:rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-25 disabled:hover:bg-transparent"
                            aria-label="Выше"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(row.id, 'down')}
                            disabled={index === sections.length - 1}
                            className="p-1.5 text-gray-500 transition-colors hover:rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-25 disabled:hover:bg-transparent"
                            aria-label="Ниже"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditSection(row, false)}
                          className="rounded-lg p-2.5 text-teal-700 transition-colors hover:bg-teal-50"
                          aria-label="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSection(row.id)}
                          className="rounded-lg p-2.5 text-red-600 transition-colors hover:bg-red-50"
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 sm:px-5">
          <p className="text-sm text-teal-900/90">
            <span className="font-semibold text-teal-950">Подсказка:</span> прокрутите любую страницу сайта внизу, чтобы
            увидеть подвал таким, каким его видят посетители.
          </p>
        </div>
      </div>

      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isNewSection ? 'Новая колонка' : 'Редактировать колонку'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setLinkDrafts([]);
                  setIsNewSection(false);
                }}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Заголовок</label>
                <input
                  className={inputClass}
                  value={editingSection.title}
                  onChange={(e) => setEditingSection((s) => (s ? { ...s, title: e.target.value } : s))}
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Slug (латиница, уникальный)</label>
                <input
                  className={inputMonoClass}
                  disabled={!isNewSection}
                  value={editingSection.slug}
                  onChange={(e) =>
                    setEditingSection((s) =>
                      s ? { ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : s,
                    )
                  }
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Тип колонки</label>
                <select
                  className={inputClass}
                  value={editingSection.section_type}
                  onChange={(e) =>
                    setEditingSection((s) =>
                      s ? { ...s, section_type: e.target.value as FooterSectionRecord['section_type'] } : s,
                    )
                  }
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.hint}
                    </option>
                  ))}
                </select>
              </div>
              {editingSection.section_type === 'manual' && (
                <div>
                  <label className={`mb-2 block ${fieldLabelClass}`}>
                    Ссылка заголовка (если колонка без подссылок)
                  </label>
                  <input
                    className={inputMonoClass}
                    placeholder="/about"
                    value={editingSection.title_href ?? ''}
                    onChange={(e) =>
                      setEditingSection((s) =>
                        s ? { ...s, title_href: e.target.value.trim() || null } : s,
                      )
                    }
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Если заполнено и подссылок нет, на сайте кликабелен только заголовок колонки.
                  </p>
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={editingSection.is_active}
                  onChange={(e) =>
                    setEditingSection((s) => (s ? { ...s, is_active: e.target.checked } : s))
                  }
                />
                <span className="text-sm text-gray-700">Показывать на сайте</span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setLinkDrafts([]);
                  setIsNewSection(false);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveSection}
                className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
              >
                Сохранить колонку
              </button>
            </div>

            {!isNewSection && editingSection.section_type === 'manual' && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Ссылки (тип «Вручную»)</h4>
                <div className="space-y-3">
                  {linkDrafts.map((d, i) => (
                    <div
                      key={d.id ?? `new-${i}`}
                      className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50/60 p-3 sm:flex-row sm:items-center"
                    >
                      <input
                        placeholder="Текст"
                        className={`${inputClass} flex-1`}
                        value={d.label ?? ''}
                        onChange={(e) => {
                          const next = [...linkDrafts];
                          next[i] = { ...next[i], label: e.target.value };
                          setLinkDrafts(next);
                        }}
                      />
                      <input
                        placeholder="/path или https://"
                        className={`${inputMonoClass} flex-1`}
                        value={d.href ?? ''}
                        onChange={(e) => {
                          const next = [...linkDrafts];
                          next[i] = { ...next[i], href: e.target.value };
                          setLinkDrafts(next);
                        }}
                      />
                      <button
                        type="button"
                        className="shrink-0 text-sm font-medium text-red-600 hover:text-red-800"
                        onClick={() => setLinkDrafts(linkDrafts.filter((_, j) => j !== i))}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setLinkDrafts([...linkDrafts, { label: '', href: '', sort_order: linkDrafts.length }])
                    }
                    className="text-sm font-medium text-teal-700 hover:text-teal-900 hover:underline"
                  >
                    + Добавить ссылку
                  </button>
                </div>
                <button
                  type="button"
                  onClick={saveManualLinks}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  Сохранить ссылки
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFooter;
