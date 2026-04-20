import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { LUCIDE_ICON_NAMES } from '../../lib/navigationIcons';
import type { ClubHomeBenefitItem } from '../../lib/types';
import { CLUB_HOME_PROMO_DEFAULT } from '../../lib/api';

const BENEFIT_SLOTS = 3;

const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';
const inputMonoClass = `${inputClass} font-mono text-sm`;

function padBenefits(list: ClubHomeBenefitItem[]): ClubHomeBenefitItem[] {
  const out = [...list];
  while (out.length < BENEFIT_SLOTS) {
    out.push({ icon_name: 'Heart', body: '' });
  }
  return out.slice(0, BENEFIT_SLOTS);
}

const AdminClubHomePromo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [ctaRegister, setCtaRegister] = useState('');
  const [ctaLogin, setCtaLogin] = useState('');
  const [benefits, setBenefits] = useState<ClubHomeBenefitItem[]>(() =>
    padBenefits(CLUB_HOME_PROMO_DEFAULT.benefits),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('club_home_promo_settings').select('*').eq('id', 'default').maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error('Не удалось загрузить настройки');
        setLoading(false);
        return;
      }
      if (data) {
        const raw = data as Record<string, unknown>;
        setHeroImageUrl(String(raw.hero_image_url ?? ''));
        setTitle(String(raw.title ?? ''));
        setBadgeText(String(raw.badge_text ?? ''));
        setCtaRegister(String(raw.cta_register_label ?? ''));
        setCtaLogin(String(raw.cta_login_label ?? ''));
        const b = raw.benefits;
        let parsed: ClubHomeBenefitItem[] = [];
        if (Array.isArray(b)) {
          parsed = b
            .map((item: unknown) => {
              if (item && typeof item === 'object' && 'body' in item) {
                return {
                  icon_name: String((item as { icon_name?: string }).icon_name ?? 'Box').trim(),
                  body: String((item as { body?: string }).body ?? '').trim(),
                };
              }
              return null;
            })
            .filter(Boolean) as ClubHomeBenefitItem[];
        }
        setBenefits(padBenefits(parsed.length > 0 ? parsed : CLUB_HOME_PROMO_DEFAULT.benefits));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateBenefit = (index: number, patch: Partial<ClubHomeBenefitItem>) => {
    setBenefits((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleSave = async () => {
    const hi = heroImageUrl.trim();
    const t = title.trim();
    const bt = badgeText.trim();
    const cr = ctaRegister.trim();
    const cl = ctaLogin.trim();
    if (!hi || !t || !bt || !cr || !cl) {
      toast.error('Заполните URL изображения, заголовок, бейдж и подписи кнопок');
      return;
    }
    const cleanBenefits = benefits
      .map((b) => ({
        icon_name: b.icon_name.trim() || 'Box',
        body: b.body.trim(),
      }))
      .filter((b) => b.body.length > 0);
    if (cleanBenefits.length === 0) {
      toast.error('Добавьте текст хотя бы в одном блоке преимуществ');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('club_home_promo_settings')
        .update({
          hero_image_url: hi,
          title: t,
          badge_text: bt,
          benefits: cleanBenefits,
          cta_register_label: cr,
          cta_login_label: cl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'default');

      if (error) throw error;
      setBenefits(padBenefits(cleanBenefits));
      toast.success('Сохранено');
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
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Клуб Sakina (главная)</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
            Блок клуба на главной: изображение, заголовки и три карточки преимуществ (иконка Lucide + текст).
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">Изображение и тексты</h2>
            <p className="mt-1 text-sm text-gray-500">Герой, заголовок и зелёная плашка над контентом блока.</p>
          </header>
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label className={`mb-2 block ${fieldLabelClass}`}>URL изображения (герой)</label>
              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className={inputMonoClass}
                placeholder="https://… или /images/…"
              />
            </div>
            <div>
              <label className={`mb-2 block ${fieldLabelClass}`}>Заголовок</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={`mb-2 block ${fieldLabelClass}`}>Текст в бейдже (зелёная плашка)</label>
              <input type="text" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-teal-200/70 bg-white shadow-sm ring-1 ring-teal-900/[0.06]">
          <header className="border-b border-teal-100/90 bg-gradient-to-r from-teal-50/70 to-white px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">Три преимущества</h2>
            <p className="mt-1 text-sm text-gray-600">
              Иконка из набора Lucide и короткий текст для каждой карточки на главной.
            </p>
          </header>
          <div className="space-y-4 p-5 sm:p-6">
            {benefits.slice(0, BENEFIT_SLOTS).map((b, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 shadow-inner ring-1 ring-black/[0.03] sm:p-5"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Карточка {index + 1}</p>
                <div className="space-y-3">
                  <div>
                    <label className={`mb-2 block ${fieldLabelClass}`}>Иконка Lucide</label>
                    <select
                      value={b.icon_name}
                      onChange={(e) => updateBenefit(index, { icon_name: e.target.value })}
                      className={`${inputClass} bg-white`}
                    >
                      {LUCIDE_ICON_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`mb-2 block ${fieldLabelClass}`}>Текст</label>
                    <textarea
                      value={b.body}
                      onChange={(e) => updateBenefit(index, { body: e.target.value })}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <header className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">Кнопки</h2>
            <p className="mt-1 text-sm text-gray-500">Подписи для регистрации и входа в клуб.</p>
          </header>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={`mb-2 block ${fieldLabelClass}`}>Кнопка регистрации</label>
              <input
                type="text"
                value={ctaRegister}
                onChange={(e) => setCtaRegister(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`mb-2 block ${fieldLabelClass}`}>Кнопка входа</label>
              <input type="text" value={ctaLogin} onChange={(e) => setCtaLogin(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4 shrink-0" aria-hidden />
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>

        <div className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 sm:px-5">
          <p className="text-sm text-teal-900/90">
            <span className="font-semibold text-teal-950">Подсказка:</span> откройте главную страницу и найдите блок клуба Sakina —
            так вы увидите результат для посетителей.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminClubHomePromo;
