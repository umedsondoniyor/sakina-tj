import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Award, Users, Heart, Target, Clock, Globe,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

/* =========================
   Types mirrored from DB
========================= */
type AboutSettings = {
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  mission_text: string | null;
  mission_section_title: string | null;
  timeline_section_title: string | null;
  timeline_section_description: string | null;
  team_section_title: string | null;
  team_section_description: string | null;
  cta_title: string | null;
  cta_description: string | null;
};

type AboutStat = {
  id: string;
  number: string;
  label: string;
  icon_key?: string | null;
  icon?: string | null;
  iconName?: string | null;
  icon_name?: string | null;
  order: number | null;
};

type AboutValue = {
  id: string;
  title: string;
  description: string;
  icon_key?: string | null;
  icon?: string | null;
  iconName?: string | null;
  icon_name?: string | null;
  order: number | null;
};

type AboutTimeline = {
  id: string;
  year: string;
  title: string;
  description: string;
  order: number | null;
};

type AboutTeam = {
  id: string;
  name: string;
  position: string;
  image_url: string;
  description: string;
  order: number | null;
};

/* =========================
   Icon Resolver (robust)
========================= */
type IconComponent = React.ComponentType<LucideProps>;

const ICONS: Record<string, IconComponent> = {
  award: Award,
  users: Users,
  heart: Heart,
  target: Target,
  clock: Clock,
  globe: Globe,
};

function pickIconKey(obj: any): string {
  return (
    obj?.icon_key ??
    obj?.icon ??
    obj?.iconName ??
    obj?.icon_name ??
    ''
  ).toString();
}

function normalizeIconKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z]/g, ' ')
    .trim()
    .split(/\s+/)
    .pop() || '';
}

function resolveIcon(keyRaw: string): IconComponent {
  const key = normalizeIconKey(keyRaw);
  return ICONS[key] ?? Award;
}

/* =========================
   Fallback content
========================= */
// Minimal fallback settings only for critical display
const FALLBACK_SETTINGS: AboutSettings = {
  hero_title: 'О компании Sakina',
  hero_subtitle: 'Мы создаем мир здорового сна уже более 30 лет, помогая людям просыпаться отдохнувшими и полными энергии.',
  hero_image_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80',
  mission_text: 'Мы верим, что качественный сон — это основа здоровой и счастливой жизни. Наша цель — предоставить каждому человеку возможность наслаждаться комфортным и восстанавливающим сном каждую ночь.',
  mission_section_title: 'Наша миссия',
  timeline_section_title: 'История развития',
  timeline_section_description: 'Путь от небольшой мастерской до ведущего производителя товаров для сна',
  team_section_title: 'Наша команда',
  team_section_description: 'Профессионалы, которые делают ваш сон лучше каждый день',
  cta_title: 'Готовы улучшить качество вашего сна?',
  cta_description: 'Свяжитесь с нами для персональной консультации и подбора идеального матраса',
};

/* =========================
   Component
========================= */
const AboutUsPage: React.FC = () => {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [stats, setStats] = useState<AboutStat[] | null>(null);
  const [values, setValues] = useState<AboutValue[] | null>(null);
  const [timeline, setTimeline] = useState<AboutTimeline[] | null>(null);
  const [team, setTeam] = useState<AboutTeam[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [settingsRes, statsRes, valuesRes, timelineRes, teamRes] = await Promise.all([
          supabase.from('about_settings').select('*').limit(1).maybeSingle(),
          supabase.from('about_stats').select('*').order('order', { ascending: true }),
          supabase.from('about_values').select('*').order('order', { ascending: true }),
          supabase.from('about_timeline').select('*').order('order', { ascending: true }),
          supabase.from('about_team').select('*').order('order', { ascending: true }),
        ]);

        setSettings(settingsRes.error || !settingsRes.data ? FALLBACK_SETTINGS : settingsRes.data as AboutSettings);
        setStats(statsRes.error ? [] : (statsRes.data || []) as AboutStat[]);
        setValues(valuesRes.error ? [] : (valuesRes.data || []) as AboutValue[]);
        setTimeline(timelineRes.error ? [] : (timelineRes.data || []) as AboutTimeline[]);
        setTeam(teamRes.error ? [] : (teamRes.data || []) as AboutTeam[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hero = settings ?? FALLBACK_SETTINGS;
  const statsArr = stats ?? [];
  const valuesArr = values ?? [];
  const timelineArr = timeline ?? [];
  const teamArr = team ?? [];

  return (
    <div className="min-h-screen bg-white">
            {/* ✅ SEO metadata */}
      <Helmet>
        <title>О компании Sakina | История, команда и ценности</title>
        <meta
          name="description"
          content="Узнайте о компании Sakina — лидере рынка товаров для сна. История бренда, ценности, команда профессионалов и стремление к совершенству."
        />
        <meta property="og:title" content="О компании Sakina | История, команда и ценности" />
        <meta
          property="og:description"
          content="Sakina — производитель матрасов и товаров для сна, заботящийся о здоровье и комфорте своих клиентов более 30 лет."
        />
        <meta property="og:image" content={hero.hero_image_url || FALLBACK_SETTINGS.hero_image_url!} />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-brand-turquoise to-brand-navy text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                {hero.hero_title || FALLBACK_SETTINGS.hero_title}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                {hero.hero_subtitle || FALLBACK_SETTINGS.hero_subtitle}
              </p>
              {statsArr.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {statsArr.slice(0, 2).map((stat) => {
                    const Icon = resolveIcon(pickIconKey(stat));
                    return (
                      <div key={stat.id} className="text-center">
                        <Icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                        <div className="text-2xl font-bold">{stat.number}</div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <img
                src={hero.hero_image_url || FALLBACK_SETTINGS.hero_image_url!}
                alt="Sakina производство"
                className="rounded-lg shadow-2xl"
              />
              {statsArr[2] && (
                <div className="absolute -bottom-6 -left-6 bg-yellow-300 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{statsArr[2].number}</div>
                  <div className="text-sm text-gray-700">{statsArr[2].label}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mission / Values */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              {hero.mission_section_title || FALLBACK_SETTINGS.mission_section_title}
            </h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8" />
            {hero.mission_text && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {hero.mission_text}
              </p>
            )}
          </div>

          {valuesArr.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Ценности компании скоро появятся</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valuesArr.map((value) => {
                const Icon = resolveIcon(pickIconKey(value));
                return (
                  <div key={value.id} className="text-center group">
                    <div className="w-16 h-16 bg-brand-turquoise rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-navy transition-colors">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-brand-navy">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              {hero.timeline_section_title || FALLBACK_SETTINGS.timeline_section_title}
            </h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8" />
            {(hero.timeline_section_description || FALLBACK_SETTINGS.timeline_section_description) && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {hero.timeline_section_description || FALLBACK_SETTINGS.timeline_section_description}
              </p>
            )}
          </div>

          {timelineArr.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">История компании скоро появится</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-brand-turquoise hidden md:block" />
              <div className="space-y-12">
                {timelineArr.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <div className="text-2xl font-bold text-brand-turquoise mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold text-brand-navy mb-3">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-2/12 justify-center">
                    <div className="w-4 h-4 bg-brand-turquoise rounded-full border-4 border-white shadow-lg" />
                  </div>
                  <div className="hidden md:block w-5/12" />
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              {hero.team_section_title || FALLBACK_SETTINGS.team_section_title}
            </h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8" />
            {(hero.team_section_description || FALLBACK_SETTINGS.team_section_description) && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {hero.team_section_description || FALLBACK_SETTINGS.team_section_description}
              </p>
            )}
          </div>

          {teamArr.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Информация о команде скоро появится</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamArr.map((member) => (
              <div key={member.id} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-48 h-48 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 rounded-full bg-brand-turquoise opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>
                <h3 className="text-xl font-semibold text-brand-navy mb-2">{member.name}</h3>
                <p className="text-brand-turquoise font-medium mb-3">{member.position}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-turquoise py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {hero.cta_title || FALLBACK_SETTINGS.cta_title}
          </h2>
          {(hero.cta_description || FALLBACK_SETTINGS.cta_description) && (
            <p className="text-lg text-white/90 mb-8">
              {hero.cta_description || FALLBACK_SETTINGS.cta_description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+992905339595"
              className="bg-white text-brand-turquoise px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Позвонить: +992 90 533 9595
            </a>
            <a
              href="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-turquoise transition-colors"
            >
              Посмотреть каталог
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
