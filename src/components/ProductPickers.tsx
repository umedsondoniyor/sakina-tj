import { useState, useEffect } from 'react';
import QuizModal from './QuizModal';
import { getQuizPickerHomeConfig, QUIZ_PICKER_HOME_DEFAULT } from '../lib/api';
import type { QuizPickerHomeConfig } from '../lib/types';

interface ProductPickersProps {
  /** From `homePageLoader` — visibility + copy + images on first paint (no flash). */
  initialConfig?: QuizPickerHomeConfig;
}

const ProductPickers = ({ initialConfig }: ProductPickersProps) => {
  const [isMattressQuizOpen, setIsMattressQuizOpen] = useState(false);
  const [isBedQuizOpen, setIsBedQuizOpen] = useState(false);
  const [config, setConfig] = useState<QuizPickerHomeConfig | null>(() => initialConfig ?? null);

  useEffect(() => {
    if (initialConfig !== undefined) {
      setConfig(initialConfig);
      return;
    }
    let cancelled = false;
    getQuizPickerHomeConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        if (!cancelled) setConfig(QUIZ_PICKER_HOME_DEFAULT);
      });
    return () => {
      cancelled = true;
    };
  }, [initialConfig]);

  if (config === null) {
    return null;
  }

  if (!config.mattress.visible && !config.bed.visible) {
    return null;
  }

  const bothPickersVisible = config.mattress.visible && config.bed.visible;

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div
          className={
            bothPickersVisible
              ? 'grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-14'
              : 'mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 sm:max-w-4xl'
          }
        >
          {config.mattress.visible ? (
            <div
              className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsMattressQuizOpen(true)}
            >
              <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
                <h3 className="text-2xl font-bold mb-2">{config.mattress.title}</h3>
                <p className="mb-4">{config.mattress.subtitle}</p>
                <span className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded font-semibold pointer-events-none">
                  {config.mattress.cta_label}
                </span>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <img
                  src={config.mattress.image_url}
                  alt=""
                  className="w-auto h-48 md:h-64 object-contain"
                />
              </div>
            </div>
          ) : null}

          {config.bed.visible ? (
            <div
              className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsBedQuizOpen(true)}
            >
              <div className="flex-1 mb-6 md:mb-0 text-brand-navy">
                <h3 className="text-2xl font-bold mb-2">{config.bed.title}</h3>
                <p className="mb-4">{config.bed.subtitle}</p>
                <span className="inline-block bg-brand-turquoise text-white px-6 py-2 rounded font-semibold pointer-events-none">
                  {config.bed.cta_label}
                </span>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <img
                  src={config.bed.image_url}
                  alt=""
                  className="w-auto h-48 md:h-64 object-contain"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {config.mattress.visible ? (
        <QuizModal open={isMattressQuizOpen} onClose={() => setIsMattressQuizOpen(false)} productType="mattress" />
      ) : null}
      {config.bed.visible ? (
        <QuizModal open={isBedQuizOpen} onClose={() => setIsBedQuizOpen(false)} productType="bed" />
      ) : null}
    </>
  );
};

export default ProductPickers;
