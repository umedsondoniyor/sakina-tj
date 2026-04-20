import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Save, X, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLucideIconByName, LUCIDE_ICON_NAMES } from '../../lib/navigationIcons';
import type { ServicePageItem, ServicesPageSettings } from '../../lib/types';

type AdminServiceItem = Omit<ServicePageItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

const emptySettings = (): Omit<ServicesPageSettings, 'id'> & { id?: string } => ({
  title: 'Наши услуги',
  description: '',
  content: '',
  cta_title: 'Готовы начать?',
  cta_description: '',
  cta_button_label: 'Связаться с нами',
});

const AdminServices: React.FC = () => {
  const [settings, setSettings] = useState(emptySettings);
  const [items, setItems] = useState<AdminServiceItem[]>([]);
  const initialItemIdsRef = useRef<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const [setRes, itemsRes] = await Promise.all([
        supabase.from('services_settings').select('*').limit(1).maybeSingle(),
        supabase.from('services_page_items').select('*').order('order_index', { ascending: true }),
      ]);

      if (setRes.error) throw setRes.error;

      if (setRes.data) {
        const row = setRes.data as ServicesPageSettings;
        setSettings({
          id: row.id,
          title: row.title,
          description: row.description,
          content: row.content,
          cta_title: row.cta_title,
          cta_description: row.cta_description,
          cta_button_label: row.cta_button_label,
        });
      }

      if (itemsRes.error) {
        console.warn('services_page_items:', itemsRes.error);
        setItems([]);
        initialItemIdsRef.current = [];
      } else {
        const rows = (itemsRes.data ?? []) as ServicePageItem[];
        setItems(rows);
        initialItemIdsRef.current = rows.map((r) => r.id);
      }
    } catch (error) {
      console.error('Error fetching services settings:', error);
      toast.error('Не удалось загрузить настройки услуг');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const moveItem = (index: number, dir: 'up' | 'down') => {
    const j = dir === 'up' ? index - 1 : index + 1;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next.map((row, i) => ({ ...row, order_index: i })));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        title: 'Новая услуга',
        description: '',
        icon_name: 'Package',
        order_index: prev.length,
        is_active: true,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index).map((row, i) => ({ ...row, order_index: i })));
  };

  const toggleItemActive = (index: number) => {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, is_active: !row.is_active } : row)),
    );
  };

  const handleSave = async () => {
    if (!settings.title.trim()) {
      toast.error('Укажите заголовок страницы');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: settings.title.trim(),
        description: settings.description?.trim() || null,
        content: settings.content?.trim() || null,
        cta_title: settings.cta_title?.trim() || null,
        cta_description: settings.cta_description?.trim() || null,
        cta_button_label: settings.cta_button_label?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (settings.id) {
        const { error } = await supabase.from('services_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('services_settings').insert([payload]).select().single();
        if (error) throw error;
        if (data) setSettings((s) => ({ ...s, id: (data as ServicesPageSettings).id }));
      }

      const idsInState = new Set(items.map((i) => i.id).filter(Boolean) as string[]);
      const toDelete = initialItemIdsRef.current.filter((id) => !idsInState.has(id));
      if (toDelete.length) {
        const { error } = await supabase.from('services_page_items').delete().in('id', toDelete);
        if (error) throw error;
      }

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const row = {
          title: it.title.trim() || 'Услуга',
          description: it.description?.trim() || null,
          icon_name: it.icon_name?.trim() || 'Package',
          order_index: i,
          is_active: it.is_active,
          updated_at: new Date().toISOString(),
        };

        if (it.id) {
          const { error } = await supabase.from('services_page_items').update(row).eq('id', it.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('services_page_items').insert({
            ...row,
            created_at: new Date().toISOString(),
          });
          if (error) throw error;
        }
      }

      await fetchSettings();
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

  const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Управление страницей услуг</h1>
            <p className="mt-1.5 text-sm text-gray-500 max-w-2xl">
              Контент публичной страницы{' '}
              <a href="/services" target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-800 font-medium">
                /services
              </a>
              : шапка, призыв к действию и карточки услуг.
            </p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm shrink-0 font-medium"
            >
              <Pencil className="w-4 h-4" aria-hidden />
              Редактировать
            </button>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ring-1 ring-black/[0.04]">
            <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">Шапка и текст</h2>
              <p className="mt-1 text-sm text-gray-500">Заголовок, подзаголовок и основной HTML-блок страницы</p>
            </header>
            <div className="p-5 sm:p-6 space-y-6">
              <div>
                <label className={`block mb-2 ${fieldLabelClass}`}>Заголовок *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    className={inputClass}
                    placeholder="Наши услуги"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{settings.title}</p>
                )}
              </div>

              <div>
                <label className={`block mb-2 ${fieldLabelClass}`}>Описание</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={settings.description || ''}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    className={inputClass}
                    placeholder="Краткое описание услуг"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{settings.description || 'Не указано'}</p>
                )}
              </div>

              <div>
                <label className={`block mb-2 ${fieldLabelClass}`}>Основной контент</label>
                {isEditing ? (
                  <>
                    <textarea
                      value={settings.content || ''}
                      onChange={(e) => setSettings({ ...settings, content: e.target.value })}
                      rows={10}
                      className={inputClass}
                      placeholder="Основной текст страницы услуг. Можно использовать HTML разметку."
                    />
                    <p className="text-xs text-gray-500 mt-2">Можно использовать HTML для форматирования текста</p>
                  </>
                ) : (
                  <div
                    className="text-gray-700 prose prose-sm sm:prose max-w-none rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-4"
                    dangerouslySetInnerHTML={{ __html: settings.content || '<p class="text-gray-400 italic">Контент не указан</p>' }}
                  />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-teal-100 bg-white shadow-sm overflow-hidden ring-1 ring-teal-900/5">
            <header className="border-b border-teal-100/80 bg-teal-50/60 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">Призыв к действию</h2>
              <p className="mt-1 text-sm text-gray-600">Блок внизу страницы услуг</p>
            </header>
            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <label className={`block mb-2 ${fieldLabelClass}`}>Заголовок</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={settings.cta_title || ''}
                    onChange={(e) => setSettings({ ...settings, cta_title: e.target.value })}
                    className={inputClass}
                    placeholder="Готовы начать?"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{settings.cta_title || '—'}</p>
                )}
              </div>
              <div>
                <label className={`block mb-2 ${fieldLabelClass}`}>Текст под заголовком</label>
                {isEditing ? (
                  <textarea
                    value={settings.cta_description || ''}
                    onChange={(e) => setSettings({ ...settings, cta_description: e.target.value })}
                    rows={3}
                    className={inputClass}
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{settings.cta_description || '—'}</p>
                )}
              </div>
              <div>
                <label className={`block mb-2 ${fieldLabelClass}`}>Текст кнопки</label>
                <p className="text-xs text-gray-500 mb-2">Ссылка ведёт на телефон из настроек сайта</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={settings.cta_button_label || ''}
                    onChange={(e) => setSettings({ ...settings, cta_button_label: e.target.value })}
                    className={inputClass}
                    placeholder="Связаться с нами"
                  />
                ) : (
                  <span className="inline-flex items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
                    {settings.cta_button_label || '—'}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ring-1 ring-black/[0.04]">
            <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Карточки услуг</h2>
                <p className="mt-1 text-sm text-gray-500">Отображаются в сетке на странице /services</p>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Добавить карточку
                </button>
              )}
            </header>

            <div className="p-5 sm:p-6">
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/80 px-4 py-10 text-center">
                  <p className="text-sm text-gray-600">Карточек пока нет.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isEditing ? 'Нажмите «Добавить карточку» выше.' : 'Включите режим редактирования и добавьте услуги.'}
                  </p>
                </div>
              ) : (
                <ul
                  className={
                    isEditing
                      ? 'space-y-4'
                      : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                  }
                >
              {items.map((item, index) => {
                const Icon = getLucideIconByName(item.icon_name);
                return (
                  <li
                    key={item.id ?? `new-${index}`}
                    className={
                      isEditing
                        ? 'border border-gray-200 rounded-xl p-4 sm:p-5 bg-gray-50/60 shadow-inner'
                        : 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow'
                    }
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-teal-600" />
                            </span>
                            <select
                              value={item.icon_name}
                              onChange={(e) => {
                                const v = e.target.value;
                                setItems((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, icon_name: v } : row)),
                                );
                              }}
                              className="text-sm border border-gray-300 rounded-lg px-2 py-2 max-w-[220px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {LUCIDE_ICON_NAMES.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleItemActive(index)}
                              className={`p-2 rounded ${item.is_active ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}
                              title={item.is_active ? 'На сайте' : 'Скрыто'}
                            >
                              {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveItem(index, 'up')}
                                className="p-1 disabled:opacity-30"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                type="button"
                                disabled={index === items.length - 1}
                                onClick={() => moveItem(index, 'down')}
                                className="p-1 disabled:opacity-30"
                              >
                                <ChevronDown size={16} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)),
                            )
                          }
                          className={`${inputClass} text-sm font-medium`}
                          placeholder="Заголовок карточки"
                        />
                        <textarea
                          value={item.description || ''}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row, i) =>
                                i === index ? { ...row, description: e.target.value } : row,
                              ),
                            )
                          }
                          rows={3}
                          className={`${inputClass} text-sm`}
                          placeholder="Описание"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-3 items-start">
                        <span className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-teal-600" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{item.title}</span>
                            {!item.is_active && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Скрыта</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description || '—'}</p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
            </div>
        </section>

        {isEditing && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-4 sm:px-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
            >
              <X className="w-4 h-4" aria-hidden />
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !settings.title.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-turquoise text-white hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              <Save className="w-4 h-4" aria-hidden />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        )}
      </div>

        <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 sm:px-5">
          <p className="text-sm text-teal-900/90">
            <span className="font-semibold text-teal-950">Подсказка:</span> после сохранения откройте{' '}
            <a href="/services" target="_blank" rel="noreferrer" className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900">
              страницу услуг
            </a>{' '}
            в новой вкладке, чтобы проверить вид для посетителей.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
