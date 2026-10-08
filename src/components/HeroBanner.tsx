import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck,
  Zap,
  Percent,
  Sparkles,
  Flame,
  Pause,
  Play
} from 'lucide-react';
import { AdBanner } from '../types';
import { Language, translations } from '../translations';
import { resolveImageUrl, CDN_FALLBACKS } from '../utils/mediaUtils';

interface HeroBannerProps {
  banners: AdBanner[];
  lang: Language;
  onExploreClick: () => void;
  onBannerClick: (banner: AdBanner) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banners,
  lang,
  onExploreClick,
  onBannerClick,
}) => {
  const t = translations[lang];
  const activeBanners = banners.filter(b => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto sliding animation timer (every 4.5 seconds)
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  const handleNext = () => {
    if (activeBanners.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }
  };

  const handlePrev = () => {
    if (activeBanners.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext(); // Swiped left -> next
    } else if (diff < -50) {
      handlePrev(); // Swiped right -> prev
    }
    touchStartX.current = null;
  };

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  return (
    <section 
      className="relative overflow-hidden bg-slate-950 text-white rounded-2xl mx-3 sm:mx-6 lg:mx-8 my-3 sm:my-4 shadow-2xl border border-slate-800 select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional Deals Slider"
    >
      {/* 
        SLIDING IMAGE TRACK:
        All images are positioned horizontally in a continuous sliding track
        animated via transform translateX
      */}
      <div 
        className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform z-0"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeBanners.map((banner, index) => (
          <div 
            key={banner.id || index}
            className="min-w-full h-full relative shrink-0 overflow-hidden"
          >
            <img
              src={resolveImageUrl(banner.imageUrl, 'hero')}
              alt={banner.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-90 transform scale-102 transition-transform duration-1000 ease-out"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('unsplash')) {
                  target.src = CDN_FALLBACKS.hero;
                }
              }}
            />
            {/* Measured contrast scrim for high WCAG AA readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30" />
            <div className="absolute inset-0 bg-radial-[at_top_right] from-transparent via-slate-950/40 to-slate-950/90" />
          </div>
        ))}
      </div>

      {/* Foreground Content with dynamic key to trigger smooth text transition */}
      <div className="relative z-10 max-w-4xl px-4 py-7 sm:px-8 sm:py-16 md:py-20 lg:px-12 flex flex-col justify-between min-h-[340px] sm:min-h-[420px]">
        <div>
          {/* Subtle unboxed kicker */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-amber-400 mb-2 sm:mb-3 tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Trending Deal #{currentIndex + 1}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="capitalize">{currentBanner?.platform} Verified</span>
          </div>

          {/* Headline with smooth key transition */}
          <div key={`title-${currentIndex}`} className="animate-[fadeIn_400ms_ease-out]">
            <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-snug sm:leading-tight text-balance max-w-2xl drop-shadow-sm">
              {lang === 'bn' && currentBanner?.titleBn 
                ? currentBanner.titleBn 
                : currentBanner?.title || 'Grand Festive Mega Savings – Up to 70% Off'}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-slate-300 mb-5 sm:mb-6 max-w-xl leading-relaxed drop-shadow-xs line-clamp-3 sm:line-clamp-none">
              {lang === 'bn' && currentBanner?.subtitleBn
                ? currentBanner.subtitleBn
                : currentBanner?.subtitle || 'Discover verified price drops, exclusive coupons, and verified buyer reviews across Amazon, Flipkart, and Meesho.'}
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (currentBanner) {
                  onBannerClick(currentBanner);
                }
                onExploreClick();
              }}
              className="w-full xs:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer"
            >
              <span>
                {lang === 'bn' && currentBanner?.buttonTextBn 
                  ? currentBanner.buttonTextBn 
                  : currentBanner?.buttonText || t.buyNow}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Deal</span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Coupon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slider Controls Bar */}
        <div className="flex items-center justify-between gap-2 mt-6 pt-3 sm:mt-8 sm:pt-4 border-t border-slate-800/80">
          
          {/* Thumbnails / Indicator Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {activeBanners.map((banner, idx) => (
              <button
                key={banner.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`group relative flex items-center gap-1 py-1 px-2 sm:px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
                aria-label={`Jump to slide ${idx + 1}`}
              >
                <span className="tabular-nums font-mono text-[10px] sm:text-[11px]">0{idx + 1}</span>
                <span className="hidden sm:inline text-[11px] uppercase tracking-wide truncate max-w-[80px]">
                  {banner.platform}
                </span>
                {currentIndex === idx && !isPaused && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 inline-block animate-ping" />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next Arrows and Auto-Play status */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
              aria-label="Pause or play slide"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handlePrev}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition-transform active:scale-90 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition-transform active:scale-90 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
