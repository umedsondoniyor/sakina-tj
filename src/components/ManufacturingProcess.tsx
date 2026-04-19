// src/components/ManufacturingProcess.tsx
import React from 'react';
import { Play } from 'lucide-react';
import type { HomeManufacturingSettings, HomeManufacturingStep } from '../lib/types';

const STATIC_HERO_FALLBACK: HomeManufacturingSettings = {
  id: 'default',
  youtube_url: 'https://youtu.be/62pbhdQ-c1M?si=5o7PK4duweZo323t',
  hero_title: 'Создание наших матрасов',
  hero_subtitle:
    'Заглянем за кулисы производственных цехов компании Sakina, чтобы узнать, откуда берется качество',
  created_at: '',
  updated_at: '',
};

function extractYouTubeId(input?: string) {
  if (!input) return '62pbhdQ-c1M';
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '').split('?')[0];
    }
    if (url.searchParams.get('v')) {
      return url.searchParams.get('v') as string;
    }
    const parts = url.pathname.split('/');
    const idx = parts.findIndex((p) => p === 'embed');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch {
    /* ignore */
  }
  return '62pbhdQ-c1M';
}

const ManufacturingProcess: React.FC<{
  initialSettings?: HomeManufacturingSettings | null;
  initialSteps?: HomeManufacturingStep[];
}> = ({ initialSettings, initialSteps }) => {
  const [playing, setPlaying] = React.useState(false);

  const settings = initialSettings ?? STATIC_HERO_FALLBACK;
  const steps =
    initialSteps && initialSteps.length > 0
      ? [...initialSteps].sort((a, b) => a.order_index - b.order_index)
      : [];

  const videoId = extractYouTubeId(settings.youtube_url);
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="relative">
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          {playing ? (
            <iframe
              src={embedSrc}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <button
              type="button"
              aria-label="Смотреть видео"
              onClick={() => setPlaying(true)}
              className="relative w-full h-full group"
            >
              <img
                src={thumb}
                alt="Процесс производства — превью видео"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=80';
                }}
              />

              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Play size={32} className="text-white ml-1.5 md:ml-2" />
                </span>
              </div>

              <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 text-white text-left">
                <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">{settings.hero_title}</h2>
                <p className="text-white/80 text-sm md:text-base max-w-xl">{settings.hero_subtitle}</p>
              </div>
            </button>
          )}
        </div>

        <noscript>
          <div className="mt-4">
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Смотреть видео на YouTube
            </a>
          </div>
        </noscript>
      </div>

      {steps.length > 0 ? (
        <section
          aria-labelledby="manufacturing-steps-heading"
          className="mt-10 md:mt-14"
        >
          <h3
            id="manufacturing-steps-heading"
            className="text-lg md:text-xl font-bold text-brand-navy mb-6 md:mb-8"
          >
            Этапы производства
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step) => (
              <figure
                key={step.id}
                className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={step.image_url}
                    alt={step.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="p-4 md:p-5 text-sm md:text-base text-gray-700 leading-snug flex-1">
                  {step.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default ManufacturingProcess;
