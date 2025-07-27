import React, { useState } from 'react';
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

const Mattresses = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Матрасы</h1>
        <p className="text-gray-600 mb-8">Подберите идеальный матрас для здорового сна</p>

        {/* Mattress Picker Banner */}
        <MattressPickerBanner onOpenQuiz={() => setIsQuizOpen(true)} />

        {/* By Type Section */}
        <MattressTypeGrid />

        {/* By Hardness Section */}
        <HardnessLevels />

        {/* Popular Filters Section */}
        <PopularFilters />

        {/* Benefits Section */}
        <Benefits />

        {/* Collections Section */}
        <CollectionsGrid />

        {/* First Purchase Section */}
        <FirstPurchaseSection />

        {/* Hit Sales Section */}
        <HitSalesSection />
      </div>

      {/* Quiz Modal */}
      <QuizModal open={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
};

export default Mattresses;