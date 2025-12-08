import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import QuizModal from './QuizModal';
import Benefits from './Benefits';

// Import mattress subcomponents
import MattressPickerBanner from './mattresses/MattressPickerBanner';
import MattressTypeGrid from './mattresses/MattressTypeGrid';
import HardnessLevels from './mattresses/HardnessLevels';
import PopularFilters from './mattresses/PopularFilters';
import CollectionsGrid from './mattresses/CollectionsGrid';
import FirstPurchaseSection from './mattresses/FirstPurchaseSection';
import HitSalesSection from './mattresses/HitSalesSection';

type MattressPageSettings = {
  hero_title: string;
  hero_description: string;
  type_section_title: string;
  hardness_section_title: string;
  popular_filters_section_title: string;
  collections_section_title: string;
  first_purchase_section_title: string;
  hit_sales_section_title: string;
  view_all_button_text: string;
};

const FALLBACK_SETTINGS: MattressPageSettings = {
  hero_title: 'Матрасы',
  hero_description: 'Подберите идеальный матрас для здорового сна',
  type_section_title: 'По типу',
  hardness_section_title: 'По жесткости',
  popular_filters_section_title: 'Популярные фильтры',
  collections_section_title: 'По коллекции',
  first_purchase_section_title: 'Первая покупка',
  hit_sales_section_title: 'Хиты продаж',
  view_all_button_text: 'Смотреть все матрасы',
};

const Mattresses = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [settings, setSettings] = useState<MattressPageSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('mattress_page_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setSettings(data as MattressPageSettings);
        }
      } catch (e) {
        console.error('Error loading mattress page settings:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Metadata */}
      <Helmet>
        <title>{settings.hero_title} — {settings.hero_description} | Sakina.tj</title>
        <meta
          name="description"
          content="Широкий выбор матрасов: ортопедические, пружинные, беспружинные. Подбор по жесткости, размеру и типу. Бесплатная доставка по Душанбе."
        />
        <meta property="og:title" content={`${settings.hero_title} — ${settings.hero_description} | Sakina.tj`} />
        <meta
          property="og:description"
          content="Выберите идеальный матрас для комфортного и здорового сна. Ортопедические матрасы, различные уровни жесткости, доставка по Душанбе."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{settings.hero_title}</h1>
          <p className="text-gray-600 mb-8">{settings.hero_description}</p>

        {/* Mattress Picker Banner */}
        <MattressPickerBanner onOpenQuiz={() => setIsQuizOpen(true)} />

        {/* By Type Section */}
        <MattressTypeGrid sectionTitle={settings.type_section_title} />

        {/* By Hardness Section */}
        <HardnessLevels sectionTitle={settings.hardness_section_title} />

        {/* Popular Filters Section */}
        <PopularFilters sectionTitle={settings.popular_filters_section_title} />

        {/* Benefits Section */}
        <Benefits />

        {/* Collections Section */}
        <CollectionsGrid 
          sectionTitle={settings.collections_section_title}
          viewAllButtonText={settings.view_all_button_text}
        />

        {/* First Purchase Section */}
        <FirstPurchaseSection sectionTitle={settings.first_purchase_section_title} />

        {/* Hit Sales Section */}
        <HitSalesSection sectionTitle={settings.hit_sales_section_title} />
      </div>

      {/* Quiz Modal */}
      <QuizModal open={isQuizOpen} onClose={() => setIsQuizOpen(false)} productType="mattress" />
      </div>
    </>
  );
};

export default Mattresses;