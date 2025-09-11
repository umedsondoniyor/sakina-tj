// src/components/ManufacturingProcess.tsx
import React from 'react';
import { Play } from 'lucide-react';

type Props = {
  /** Optional: override with another YouTube URL or ID later */
  youtubeUrlOrId?: string;
  /** Optional: custom title for a11y/SEO */
  title?: string;
};

function extractYouTubeId(input?: string) {
  if (!input) return '62pbhdQ-c1M'; // default to your video
  // If it's already an ID-like string, return it
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  // Try to pull ID from common YouTube URL forms
  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }
    if (url.searchParams.get('v')) {
      return url.searchParams.get('v') as string;
    }
    // /embed/<id>
    const parts = url.pathname.split('/');
    const idx = parts.findIndex((p) => p === 'embed');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch {
    /* ignore */
  }
  return '62pbhdQ-c1M';
}

const ManufacturingProcess: React.FC<Props> = ({
  youtubeUrlOrId = 'https://youtu.be/62pbhdQ-c1M?si=5o7PK4duweZo323t',
  title = 'Создание наших матрасов',
}) => {
  const [playing, setPlaying] = React.useState(false);

  const videoId = extractYouTubeId(youtubeUrlOrId);
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
              {/* Thumbnail */}
              <img
                src={thumb}
                alt="Процесс производства — превью видео"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to an Unsplash if maxres not available
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=80';
                }}
              />

              {/* Dark overlay + Play button */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Play size={32} className="text-white ml-1.5 md:ml-2" />
                </span>
              </div>

              {/* Caption overlay */}
              <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 text-white text-left">
                <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
                  {title}
                </h2>
                <p className="text-white/80 text-sm md:text-base max-w-xl">
                  Заглянем за кулисы производственных цехов компании Sakina, чтобы узнать, откуда берется качество
                </p>
              </div>
            </button>
          )}
        </div>

        {/* noscript fallback */}
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
    </div>
  );
};

export default ManufacturingProcess;
