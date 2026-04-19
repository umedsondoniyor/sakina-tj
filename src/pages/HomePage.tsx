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
import Benefits from '../components/Benefits';
import type { HomePageLoaderData } from '../loaders/publicLoaders';
import { HOME_SEO_FALLBACK } from '../lib/seo';

const HomePage: React.FC = () => {
  const loaderData = useLoaderData() as HomePageLoaderData | undefined;
  const seoTitle = loaderData?.seo?.title ?? HOME_SEO_FALLBACK.title;
  const seoDescription = loaderData?.seo?.description ?? HOME_SEO_FALLBACK.description;
  const extraMeta = loaderData?.seo?.extraMeta ?? [];

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} canonicalPath="/" extraMeta={extraMeta} />

      {/* ✅ Page content */}
      <HeroCarousel initialSlides={loaderData?.slides} />
      <CategoryGrid />
      <ProductPickers />
      <CustomerReviews initialReviews={loaderData?.reviews} />
      <Features initialBlocks={loaderData?.featureBlocks} />
      <Benefits />
      <SleepClubBlog initialPosts={loaderData?.blogPosts} />
      <AskonaClub />
      <ManufacturingProcess />
      <ContactSection />
    </>
  );
};

export default HomePage;
