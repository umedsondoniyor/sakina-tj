// src/pages/HomePage.tsx
import React from 'react';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductPickers from '../components/ProductPickers';
import Promotions from '../components/Promotions';
import AskonaClub from '../components/AskonaClub';
import BestSellers from '../components/BestSellers';
import CustomerReviews from '../components/CustomerReviews';
import RecommendedProducts from '../components/RecommendedProducts';
import ProductionStats from '../components/ProductionStats';
import ManufacturingProcess from '../components/ManufacturingProcess';
import SleepClubBlog from '../components/SleepClubBlog';
import AboutUs from '../components/AboutUs';
import Features from '../components/Features';
import ContactSection from '../components/ContactSection';
import NotificationAlert from '../components/NotificationAlert';
import Benefits from '../components/Benefits';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroCarousel />
      <CategoryGrid />
      <Features />
      <ProductPickers />
      <Benefits />
      <CustomerReviews />
      <SleepClubBlog />
      <AskonaClub />
      <AboutUs />
      <ManufacturingProcess />
      <ContactSection />
      <NotificationAlert />
    </>
  );
};

export default HomePage;
