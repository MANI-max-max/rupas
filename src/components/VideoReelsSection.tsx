import React, { useState } from 'react';
import { Play, Eye, ExternalLink, ArrowRight, X } from 'lucide-react';
import { VideoAd, Product } from '../types';
import { Language, translations } from '../translations';
import { resolveImageUrl, formatYouTubeEmbedUrl, isDirectVideoFile, CDN_FALLBACKS } from '../utils/mediaUtils';

interface VideoReelsSectionProps {
  videos: VideoAd[];
  products: Product[];
  lang: Language;
  onVideoClick: (video: VideoAd) => void;
  onProductClick: (product: Product) => void;
}

export const VideoReelsSection: React.FC<VideoReelsSectionProps> = ({
  videos,
  products,
  lang,
  onVideoClick,
  onProductClick,
}) => {
  const t = translations[lang];
  const [activeVideoModal, setActiveVideoModal] = useState<VideoAd | null>(null);

  const activeVideos = videos.filter(v => v.active);
  if (activeVideos.length === 0) return null;

  const handlePlayVideo = (video: VideoAd) => {
    setActiveVideoModal(video);
    onVideoClick(video);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <div className="text-[11px] sm:text-xs font-bold text-amber-500 uppercase tracking-wider">
            Hands-on Tests & Video Reviews
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t.videoReviews}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {activeVideos.map(video => {
          const linkedProduct = products.find(p => p.id === video.productId);

          return (
            <div 
              key={video.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Video Thumbnail banner */}
              <div 
                onClick={() => handlePlayVideo(video)}
                className="relative aspect-16/9 bg-slate-950 overflow-hidden cursor-pointer group"
              >
                <img
                  src={resolveImageUrl(video.thumbnailUrl, 'earbuds')}
                  alt={video.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('unsplash')) {
                      target.src = CDN_FALLBACKS.earbuds;
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Play Button Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between text-white text-xs font-medium">
                  <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs text-[11px] sm:text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{video.views.toLocaleString()} views</span>
                  </span>
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold text-[10px] sm:text-[11px]">
                    Watch Unboxing
                  </span>
                </div>
              </div>

              {/* Description & linked product footer */}
              <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {video.description}
                  </p>
                </div>

                {linkedProduct && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 truncate">
                      {linkedProduct.title}
                    </span>
                    <button
                      onClick={() => onProductClick(linkedProduct)}
                      className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      <span>Check Price (₹{linkedProduct.dealPrice.toLocaleString()})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Play Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setActiveVideoModal(null)}
          />
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl z-10 border border-slate-800">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 text-white gap-2">
              <span className="text-xs font-semibold line-clamp-1 flex-1">{activeVideoModal.title}</span>
              <div className="flex items-center gap-1 shrink-0">
                {activeVideoModal.videoUrl && (
                  <a
                    href={activeVideoModal.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                    title="Open Video in New Tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button 
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {isDirectVideoFile(activeVideoModal.videoUrl) ? (
                <video
                  src={activeVideoModal.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={formatYouTubeEmbedUrl(activeVideoModal.videoUrl)}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
