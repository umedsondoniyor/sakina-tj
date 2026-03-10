import React from 'react';
import { useLoaderData } from 'react-router-dom';
import SEO from '../components/SEO';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductPickers from '../components/ProductPickers';
import AskonaClub from '../components/SakinaClub';
import CustomerReviews from '../components/CustomerReviews';
import ManufacturingProcess from '../components/ManufacturingProcess';
import SleepClubBlog from '../components/SleepClubBlog';
import Features from '../components/Features';
import ContactSection from '../components/ContactSection';
import NotificationAlert from '../components/NotificationAlert';
import Benefits from '../components/Benefits';
import type { HomePageLoaderData } from '../loaders/publicLoaders';

const HomePage: React.FC = () => {
  const loaderData = useLoaderData() as HomePageLoaderData | undefined;

  return (
    <>
      <SEO
        title="Матрасы и товары для сна в Душанбе"
        description="Матрасы, кровати, подушки и товары для сна в Душанбе с доставкой и гарантией."
        canonicalPath="/"
      />

      {/* ✅ Page content */}
      <HeroCarousel initialSlides={loaderData?.slides} />
      <CategoryGrid />
      <Features />
      <ProductPickers />
      <Benefits />
      <CustomerReviews initialReviews={loaderData?.reviews} />
      <SleepClubBlog initialPosts={loaderData?.blogPosts} />
      <AskonaClub />
      <ManufacturingProcess />
      <ContactSection />
      <NotificationAlert />
    </>
  );
};

export default HomePage;
