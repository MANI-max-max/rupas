import React from 'react';
import { Home, Layers, Flame, PackageCheck, ShoppingBag } from 'lucide-react';
import { Language, translations } from '../translations';

interface MobileBottomNavProps {
  lang: Language;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenAdmin?: () => void;
  onScrollToTop: () => void;
  onToggleCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  lang,
  cartCount,
  onOpenCart,
  onOpenTracking,
  onOpenAdmin,
  onScrollToTop,
  onToggleCategories,
}) => {
  const t = translations[lang];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] px-3 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={onScrollToTop}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer active:scale-95"
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('products-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer active:scale-95"
          aria-label="Top Deals"
        >
          <Flame className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-medium mt-0.5">Deals</span>
        </button>

        <button
          onClick={onToggleCategories}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer active:scale-95"
          aria-label="Categories & Filters"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Filter</span>
        </button>

        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer active:scale-95"
          aria-label="Track Order"
        >
          <PackageCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-medium mt-0.5">Track</span>
        </button>
      </div>
    </nav>
  );
};

