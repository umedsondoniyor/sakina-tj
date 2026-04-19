import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Save, Plus, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
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
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-2">Подвал сайта</h1>
        <p className="text-sm text-gray-600 mb-6">
          Контакты, юридический блок и колонки ссылок на сайте. Публичная страница использует те же данные.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Контакты и нижний блок</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Телефон (текст)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={settings.phone_display}
                onChange={(e) => setSettings((s) => ({ ...s, phone_display: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Телефон (href)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                value={settings.phone_href}
                onChange={(e) => setSettings((s) => ({ ...s, phone_href: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={settings.email}
                onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email (href)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                value={settings.email_href}
                onChange={(e) => setSettings((s) => ({ ...s, email_href: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Адрес</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={settings.address}
              onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Копирайт (строка 1, {'{year}'} — год)
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={settings.copyright_line1}
              onChange={(e) => setSettings((s) => ({ ...s, copyright_line1: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Копирайт (строка 2)</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={settings.copyright_line2 ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, copyright_line2: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Юридический текст (внизу)</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              value={settings.legal_text ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, legal_text: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Подпись к способам оплаты</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={settings.payment_label}
                onChange={(e) => setSettings((s) => ({ ...s, payment_label: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_payment_icons}
                onChange={(e) => setSettings((s) => ({ ...s, show_payment_icons: e.target.checked }))}
              />
              <span className="text-sm">Показывать иконки Visa / Mastercard</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Заголовок соцсетей</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={settings.social_heading}
              onChange={(e) => setSettings((s) => ({ ...s, social_heading: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ссылка Instagram</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              value={settings.instagram_url ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, instagram_url: e.target.value }))}
            />
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={savingSettings}
            className="inline-flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {savingSettings ? 'Сохранение…' : 'Сохранить контакты и нижний блок'}
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Колонки ссылок</h2>
          <button
            type="button"
            onClick={() => openEditSection(null, true)}
            className="inline-flex items-center px-3 py-2 bg-brand-turquoise text-white rounded-lg text-sm hover:bg-brand-navy"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить колонку
          </button>
        </div>

        <div className="space-y-3">
          {sections.map((row, index) => (
            <div
              key={row.id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-start justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">{row.title}</p>
                <p className="text-xs text-gray-500">
                  slug: {row.slug} ·{' '}
                  {SECTION_TYPES.find((t) => t.value === row.section_type)?.label ?? row.section_type}
                  {!row.is_active ? ' · скрыта' : ''}
                </p>
                {row.section_type === 'manual' &&
                  (row.footer_section_links.length === 0 && row.title_href ? (
                    <p className="text-xs text-gray-600 mt-1">
                      Только заголовок → {row.title_href}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1">
                      {row.footer_section_links.length} ссылок
                    </p>
                  ))}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => moveSection(row.id, 'up')}
                  disabled={index === 0}
                  className="p-1 border rounded disabled:opacity-30"
                  aria-label="Выше"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(row.id, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-1 border rounded disabled:opacity-30"
                  aria-label="Ниже"
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSectionActive(row)}
                  className={`text-xs px-2 py-1 rounded ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}
                >
                  {row.is_active ? 'Активна' : 'Скрыта'}
                </button>
                <button
                  type="button"
                  onClick={() => openEditSection(row, false)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSection(row.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingSection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 my-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">{isNewSection ? 'Новая колонка' : 'Редактировать колонку'}</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setLinkDrafts([]);
                  setIsNewSection(false);
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Заголовок</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection((s) => (s ? { ...s, title: e.target.value } : s))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Slug (латиница, уникальный)
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Тип колонки</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ссылка заголовка (если колонка без подссылок)
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="/about"
                    value={editingSection.title_href ?? ''}
                    onChange={(e) =>
                      setEditingSection((s) =>
                        s ? { ...s, title_href: e.target.value.trim() || null } : s,
                      )
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Если заполнено и подссылок нет, на сайте кликабелен только заголовок колонки.
                  </p>
                </div>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingSection.is_active}
                  onChange={(e) =>
                    setEditingSection((s) => (s ? { ...s, is_active: e.target.checked } : s))
                  }
                />
                <span className="text-sm">Показывать на сайте</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setLinkDrafts([]);
                  setIsNewSection(false);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveSection}
                className="px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy"
              >
                Сохранить колонку
              </button>
            </div>

            {!isNewSection && editingSection.section_type === 'manual' && (
              <div className="mt-8 border-t pt-6">
                <h4 className="font-semibold mb-3">Ссылки (только для типа «Вручную»)</h4>
                <div className="space-y-2">
                  {linkDrafts.map((d, i) => (
                    <div key={d.id ?? `new-${i}`} className="flex flex-col sm:flex-row gap-2">
                      <input
                        placeholder="Текст"
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        value={d.label ?? ''}
                        onChange={(e) => {
                          const next = [...linkDrafts];
                          next[i] = { ...next[i], label: e.target.value };
                          setLinkDrafts(next);
                        }}
                      />
                      <input
                        placeholder="/path или https://"
                        className="flex-1 border rounded px-2 py-1 text-sm font-mono"
                        value={d.href ?? ''}
                        onChange={(e) => {
                          const next = [...linkDrafts];
                          next[i] = { ...next[i], href: e.target.value };
                          setLinkDrafts(next);
                        }}
                      />
                      <button
                        type="button"
                        className="text-red-600 text-sm px-2"
                        onClick={() => setLinkDrafts(linkDrafts.filter((_, j) => j !== i))}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLinkDrafts([...linkDrafts, { label: '', href: '', sort_order: linkDrafts.length }])}
                    className="text-sm text-teal-600 hover:underline"
                  >
                    + Добавить ссылку
                  </button>
                </div>
                <button
                  type="button"
                  onClick={saveManualLinks}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900"
                >
                  <Save className="w-4 h-4 mr-2" />
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
