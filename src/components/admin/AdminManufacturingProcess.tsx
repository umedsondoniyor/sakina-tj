import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import HomeManufacturingStepModal from './HomeManufacturingStepModal';
import type { HomeManufacturingStep } from '../../lib/types';

const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';
const addButtonClass =
  'inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 shrink-0';

const AdminManufacturingProcess = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [steps, setSteps] = useState<HomeManufacturingStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<HomeManufacturingStep | undefined>();

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('home_manufacturing_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setYoutubeUrl(data.youtube_url);
        setHeroTitle(data.hero_title);
        setHeroSubtitle(data.hero_subtitle);
      }
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить настройки видео');
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchSteps = async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setStepsLoading(true);
    try {
      const { data, error } = await supabase
        .from('home_manufacturing_steps')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить этапы');
    } finally {
      if (!opts?.quiet) setStepsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchSteps();
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = youtubeUrl.trim();
    const t = heroTitle.trim();
    const s = heroSubtitle.trim();
    if (!u || !t || !s) {
      toast.error('Заполните все поля блока с видео');
      return;
    }

    setSettingsSaving(true);
    try {
      const payload = {
        youtube_url: u,
        hero_title: t,
        hero_subtitle: s,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('home_manufacturing_settings')
        .update(payload)
        .eq('id', 'default');

      if (error) throw error;
      toast.success('Настройки сохранены');
      await fetchSettings();
    } catch (err) {
      console.error(err);
      toast.error('Не удалось сохранить');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleDeleteStep = async (id: string) => {
    if (!confirm('Удалить этот этап?')) return;

    try {
      const { error } = await supabase.from('home_manufacturing_steps').delete().eq('id', id);
      if (error) throw error;
      setSteps(steps.filter((i) => i.id !== id));
      toast.success('Этап удалён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось удалить');
    }
  };

  const toggleStepActive = async (row: HomeManufacturingStep) => {
    try {
      const { error } = await supabase
        .from('home_manufacturing_steps')
        .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
        .eq('id', row.id);

      if (error) throw error;
      setSteps(
        steps.map((i) => (i.id === row.id ? { ...i, is_active: !i.is_active } : i)),
      );
      toast.success(row.is_active ? 'Скрыто на сайте' : 'Показано на сайте');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось обновить статус');
    }
  };

  const moveStep = async (id: string, direction: 'up' | 'down') => {
    const idx = steps.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= steps.length) return;

    try {
      const a = steps[idx];
      const b = steps[newIdx];
      await Promise.all([
        supabase.from('home_manufacturing_steps').update({ order_index: b.order_index }).eq('id', a.id),
        supabase.from('home_manufacturing_steps').update({ order_index: a.order_index }).eq('id', b.id),
      ]);
      await fetchSteps({ quiet: true });
      toast.success('Порядок обновлён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось изменить порядок');
    }
  };

  const defaultOrderIndex =
    steps.length > 0 ? Math.max(...steps.map((i) => i.order_index)) + 1 : 0;

  const loading = settingsLoading || stepsLoading;

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50/50 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
          <span className="text-sm text-gray-600">Загрузка…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Процесс производства (главная)
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
            Видео YouTube и подписи на превью, затем карточки этапов с изображением и текстом — блок на главной странице.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <form onSubmit={saveSettings}>
            <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">Видео и текст на превью</h2>
              <p className="mt-1 text-sm text-gray-500">
                Ссылка на ролик, заголовок и подзаголовок над плеером на главной.
              </p>
            </header>
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Ссылка на YouTube или ID ролика *</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://youtu.be/…"
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Заголовок на превью *</label>
                <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Подзаголовок *</label>
                <textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
              <button
                type="submit"
                disabled={settingsSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4 shrink-0" aria-hidden />
                {settingsSaving ? 'Сохранение…' : 'Сохранить видео'}
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-teal-200/70 bg-white shadow-sm ring-1 ring-teal-900/[0.06]">
          <div className="flex flex-col gap-4 border-b border-teal-100/90 bg-gradient-to-r from-teal-50/70 to-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Этапы производства</h2>
              <p className="mt-1 text-sm text-gray-600">
                Карточки с фото и подписью под видео — порядок как в списке ниже.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedStep(undefined);
                setIsModalOpen(true);
              }}
              className={addButtonClass}
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Добавить этап
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {steps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-12 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-gray-400" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold text-gray-900">Пока нет этапов</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                  Добавьте карточки с фото и подписью — они появятся под видео на главной.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {steps.map((row, index) => (
                  <li
                    key={row.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-shadow hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <img
                        src={row.image_url}
                        alt=""
                        className="h-28 w-28 shrink-0 rounded-xl border border-gray-100 object-cover shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{row.caption}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500">
                            <span className="font-medium text-gray-600">Порядок:</span> {row.order_index}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleStepActive(row)}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              row.is_active
                                ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80 hover:bg-emerald-200/80'
                                : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {row.is_active ? 'На сайте' : 'Скрыто'}
                          </button>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:border-l sm:border-gray-100 sm:pl-4">
                        <div className="inline-flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => moveStep(row.id, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-500 transition-colors hover:rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-25 disabled:hover:bg-transparent"
                            aria-label="Выше"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStep(row.id, 'down')}
                            disabled={index === steps.length - 1}
                            className="p-1.5 text-gray-500 transition-colors hover:rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-25 disabled:hover:bg-transparent"
                            aria-label="Ниже"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStep(row);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg p-2.5 text-teal-700 transition-colors hover:bg-teal-50"
                          aria-label="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(row.id)}
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
            <span className="font-semibold text-teal-950">Подсказка:</span> откройте главную страницу сайта и прокрутите до блока
            «Процесс производства», чтобы проверить вид для посетителей.
          </p>
        </div>
      </div>

      <HomeManufacturingStepModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStep(undefined);
        }}
        item={selectedStep}
        defaultOrderIndex={defaultOrderIndex}
        onSuccess={() => fetchSteps({ quiet: true })}
      />
    </div>
  );
};

export default AdminManufacturingProcess;
