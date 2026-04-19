import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import HomeManufacturingStepModal from './HomeManufacturingStepModal';
import type { HomeManufacturingStep } from '../../lib/types';

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
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
          <span className="text-gray-600">Загрузка…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Процесс производства (главная)</h1>
        <p className="text-sm text-gray-600 mt-1">
          Видео YouTube и подписи на превью, затем карточки этапов с изображением и текстом.
        </p>
      </div>

      <form onSubmit={saveSettings} className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Видео и текст на превью</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на YouTube или ID ролика *</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="https://youtu.be/…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок на превью *</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок *</label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={settingsSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {settingsSaving ? 'Сохранение…' : 'Сохранить видео'}
          </button>
        </div>
      </form>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Этапы производства</h2>
        <button
          type="button"
          onClick={() => {
            setSelectedStep(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить этап
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Пока нет этапов</h3>
          <p className="mt-1 text-sm text-gray-500">
            Добавьте карточки с фото и подписью — они появятся под видео на главной.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((row, index) => (
            <div
              key={row.id}
              className="bg-white rounded-lg shadow border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <img
                src={row.image_url}
                alt=""
                className="w-28 h-28 object-cover rounded shrink-0 border border-gray-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{row.caption}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>Порядок: {row.order_index}</span>
                  <button
                    type="button"
                    onClick={() => toggleStepActive(row)}
                    className={`px-2 py-0.5 rounded font-medium ${
                      row.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {row.is_active ? 'На сайте' : 'Скрыто'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveStep(row.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    aria-label="Выше"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(row.id, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    aria-label="Ниже"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStep(row);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded"
                  aria-label="Редактировать"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStep(row.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  aria-label="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
