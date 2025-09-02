import React, { useEffect, useState } from 'react';
import {
  Award, Users, Heart, Target, Clock, Globe, type LucideIcon
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

/* =========================
   Types (mirror Supabase)
   ========================= */
type AboutSettings = {
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
};

type AboutStat = {
  id: string;
  number: string;
  label: string;
  icon_key: string;
  order: number | null;
};

type AboutValue = {
  id: string;
  title: string;
  description: string;
  icon_key: string;
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
   Icon Resolver (tolerant)
   ========================= */
const ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  users: Users,
  award: Award,
  globe: Globe,
  heart: Heart,
  target: Target,
};

const ICON_ALIASES: Record<string, string> = {
  time: 'clock',
  timer: 'clock',
  people: 'users',
  team: 'users',
  medal: 'award',
  trophy: 'award',
  world: 'globe',
  earth: 'globe',
  love: 'heart',
  care: 'heart',
  aim: 'target',
  goals: 'target',
  focus: 'target',
};

function resolveIcon(key?: string): LucideIcon {
  if (!key) return Award;
  const norm = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (ICONS[norm]) return ICONS[norm];
  if (ICON_ALIASES[norm] && ICONS[ICON_ALIASES[norm]]) return ICONS[ICON_ALIASES[norm]];
  const stripped = norm.replace(/(icon|logo)$/, '');
  if (ICONS[stripped]) return ICONS[stripped];
  return Award;
}

/* =========================
   Fallback Content
   ========================= */
const FALLBACK_SETTINGS: AboutSettings = {
  hero_title: 'О компании Sakina',
  hero_subtitle:
    'Мы создаем мир здорового сна уже более 30 лет, помогая людям просыпаться отдохнувшими и полными энергии.',
  hero_image_url:
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80',
};

const FALLBACK_STATS: AboutStat[] = [
  { id: '1', number: '30+', label: 'лет на рынке', icon_key: 'clock', order: 1 },
  { id: '2', number: '50,000+', label: 'довольных клиентов', icon_key: 'users', order: 2 },
  { id: '3', number: '100+', label: 'моделей продукции', icon_key: 'award', order: 3 },
  { id: '4', number: '5', label: 'стран присутствия', icon_key: 'globe', order: 4 },
];

const FALLBACK_VALUES: AboutValue[] = [
  {
    id: '1',
    icon_key: 'heart',
    title: 'Забота о здоровье',
    description:
      'Мы создаем продукцию, которая способствует здоровому сну и улучшению качества жизни наших клиентов.',
    order: 1,
  },
  {
    id: '2',
    icon_key: 'award',
    title: 'Качество превыше всего',
    description: 'Используем только проверенные материалы и современные технологии производства.',
    order: 2,
  },
  {
    id: '3',
    icon_key: 'users',
    title: 'Индивидуальный подход',
    description:
      'Каждый клиент уникален, поэтому мы предлагаем персональные решения для комфортного сна.',
    order: 3,
  },
  {
    id: '4',
    icon_key: 'target',
    title: 'Постоянное развитие',
    description:
      'Мы постоянно совершенствуем наши продукты и услуги, следуя последним тенденциям в индустрии сна.',
    order: 4,
  },
];

const FALLBACK_TIMELINE: AboutTimeline[] = [
  { id: 't1', year: '1990', title: 'Основание компании', description: 'Начало пути в индустрии здорового сна', order: 1 },
  { id: 't2', year: '2000', title: 'Первая лаборатория', description: 'Открытие собственной лаборатории контроля качества', order: 2 },
  { id: 't3', year: '2010', title: 'Международное признание', description: 'Получение международных сертификатов качества', order: 3 },
  { id: 't4', year: '2020', title: 'Цифровая трансформация', description: 'Запуск онлайн-платформы и цифровых сервисов', order: 4 },
  { id: 't5', year: '2025', title: 'Новые горизонты', description: 'Расширение ассортимента и география присутствия', order: 5 },
];

const FALLBACK_TEAM: AboutTeam[] = [
  {
    id: 'a1',
    name: 'Алексей Иванов',
    position: 'Генеральный директор',
    image_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    description: 'Более 15 лет опыта в индустрии товаров для сна',
    order: 1,
  },
  {
    id: 'a2',
    name: 'Мария Петрова',
    position: 'Главный технолог',
    image_url:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=300&q=80',
    description: 'Эксперт по инновационным материалам и технологиям',
    order: 2,
  },
  {
    id: 'a3',
    name: 'Дмитрий Сидоров',
    position: 'Руководитель производства',
    image_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    description: 'Контроль качества на каждом этапе производства',
    order: 3,
  },
];

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

        const [
          settingsRes,
          statsRes,
          valuesRes,
          timelineRes,
          teamRes,
        ] = await Promise.all([
          supabase.from('about_settings').select('*').limit(1).maybeSingle(),
          supabase.from('about_stats').select('*').order('order', { ascending: true }),
          supabase.from('about_values').select('*').order('order', { ascending: true }),
          supabase.from('about_timeline').select('*').order('order', { ascending: true }),
          supabase.from('about_team').select('*').order('order', { ascending: true }),
        ]);

        setSettings(
          settingsRes.error || !settingsRes.data
            ? FALLBACK_SETTINGS
            : (settingsRes.data as AboutSettings)
        );

        setStats(
          statsRes.error || !statsRes.data || statsRes.data.length === 0
            ? FALLBACK_STATS
            : (statsRes.data as AboutStat[])
        );

        setValues(
          valuesRes.error || !valuesRes.data || valuesRes.data.length === 0
            ? FALLBACK_VALUES
            : (valuesRes.data as AboutValue[])
        );

        setTimeline(
          timelineRes.error || !timelineRes.data || timelineRes.data.length === 0
            ? FALLBACK_TIMELINE
            : (timelineRes.data as AboutTimeline[])
        );

        setTeam(
          teamRes.error || !teamRes.data || teamRes.data.length === 0
            ? FALLBACK_TEAM
            : (teamRes.data as AboutTeam[])
        );
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
  const statsArr = (stats ?? FALLBACK_STATS).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const valuesArr = (values ?? FALLBACK_VALUES).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const timelineArr = (timeline ?? FALLBACK_TIMELINE).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const teamArr = (team ?? FALLBACK_TEAM).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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
              <div className="grid grid-cols-2 gap-6">
                {statsArr.slice(0, 2).map((stat) => {
                  const Icon = resolveIcon(stat.icon_key);
                  return (
                    <div key={stat.id} className="text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                      <div className="text-2xl font-bold">{stat.number}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
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

      {/* Mission Section */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">Наша миссия</h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Мы верим, что качественный сон — это основа здоровой и счастливой жизни.
              Наша цель — предоставить каждому человеку возможность наслаждаться комфортным
              и восстанавливающим сном каждую ночь.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valuesArr.map((value) => {
              const Icon = resolveIcon(value.icon_key);
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
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">История развития</h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Путь от небольшой мастерской до ведущего производителя товаров для сна
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-brand-turquoise hidden md:block"></div>

            <div className="space-y-12">
              {timelineArr.map((item, index) => (
                <div key={item.id} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <div className="text-2xl font-bold text-brand-turquoise mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold text-brand-navy mb-3">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:flex w-2/12 justify-center">
                    <div className="w-4 h-4 bg-brand-turquoise rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  <div className="hidden md:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">Наша команда</h2>
            <div className="bg-yellow-300 h-2 w-16 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Профессионалы, которые делают ваш сон лучше каждый день
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamArr.map((member) => (
              <div key={member.id} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-48 h-48 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 rounded-full bg-brand-turquoise opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-semibold text-brand-navy mb-2">{member.name}</h3>
                <p className="text-brand-turquoise font-medium mb-3">{member.position}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-brand-turquoise py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готовы улучшить качество вашего сна?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Свяжитесь с нами для персональной консультации и подбора идеального матраса
          </p>
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
