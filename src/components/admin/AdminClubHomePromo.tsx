import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { LUCIDE_ICON_NAMES } from '../../lib/navigationIcons';
import type { ClubHomeBenefitItem, ClubHomePromoSettings } from '../../lib/types';
import { CLUB_HOME_PROMO_DEFAULT } from '../../lib/api';

const BENEFIT_SLOTS = 3;

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
      <div className="flex items-center justify-center h-64 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Клуб Sakina (главная)</h1>
      <p className="text-sm text-gray-600 mt-1 mb-8">
        Блок клуба на главной странице: изображение, заголовки и три карточки преимуществ (иконка Lucide + текст).
      </p>

      <div className="space-y-4 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL изображения (герой)</label>
          <input
            type="text"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="https://… или /images/…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст в бейдже (зелёная плашка)</label>
          <input
            type="text"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">Три преимущества</p>
          <div className="space-y-6">
            {benefits.slice(0, BENEFIT_SLOTS).map((b, index) => (
              <div key={index} className="rounded-lg border border-gray-100 p-4 bg-gray-50/80">
                <p className="text-xs text-gray-500 mb-2">Карточка {index + 1}</p>
                <label className="block text-xs font-medium text-gray-600 mb-1">Иконка Lucide</label>
                <select
                  value={b.icon_name}
                  onChange={(e) => updateBenefit(index, { icon_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                >
                  {LUCIDE_ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <label className="block text-xs font-medium text-gray-600 mb-1">Текст</label>
                <textarea
                  value={b.body}
                  onChange={(e) => updateBenefit(index, { body: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Кнопка регистрации</label>
            <input
              type="text"
              value={ctaRegister}
              onChange={(e) => setCtaRegister(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Кнопка входа</label>
            <input
              type="text"
              value={ctaLogin}
              onChange={(e) => setCtaLogin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy disabled:opacity-50 font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
};

export default AdminClubHomePromo;
