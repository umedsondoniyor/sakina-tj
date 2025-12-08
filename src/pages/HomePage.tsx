import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductPickers from '../components/ProductPickers';
import Promotions from '../components/Promotions';
import AskonaClub from '../components/SakinaClub';
import BestSellers from '../components/BestSellers';
import CustomerReviews from '../components/CustomerReviews';
import RecommendedProducts from '../components/RecommendedProducts';
import ProductionStats from '../components/ProductionStats';
import ManufacturingProcess from '../components/ManufacturingProcess';
import SleepClubBlog from '../components/SleepClubBlog';
import Features from '../components/Features';
import ContactSection from '../components/ContactSection';
import NotificationAlert from '../components/NotificationAlert';
import Benefits from '../components/Benefits';

const HomePage: React.FC = () => {
  return (
    <>
      {/* ✅ SEO metadata */}
      <Helmet>
        <title>Sakina.tj — Матрасы, подушки и товары для сна в Таджикистане</title>
        <meta
          name="description"
          content="Интернет-магазин Sakina.tj предлагает матрасы, подушки, кровати и аксессуары для сна высокого качества. Индивидуальный подход, инновации и забота о каждом клиенте."
        />
        <meta property="og:title" content="Sakina.tj — Комфортный сон для всей семьи" />
        <meta
          property="og:description"
          content="Sakina.tj помогает выбрать идеальный матрас и товары для сна. Комфорт, качество и бесплатная доставка по Таджикистану."
        />
        <meta property="og:image" content="/og-home.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ✅ Page content */}
      <HeroCarousel />
      <CategoryGrid />
      <Features />
      <ProductPickers />
      <Benefits />
      <CustomerReviews />
      <SleepClubBlog />
      <AskonaClub />
      <ManufacturingProcess />
      <ContactSection />
      <NotificationAlert />
    </>
  );
};

export default HomePage;
