import React from 'react';
import { Home, Layers, ShoppingBag, PackageCheck, ShieldCheck } from 'lucide-react';
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={onScrollToTop}
          className="flex flex-col items-center justify-center p-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>

        <button
          onClick={onToggleCategories}
          className="flex flex-col items-center justify-center p-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Filter</span>
        </button>

        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center p-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-1 bg-amber-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-medium mt-0.5">{t.cart}</span>
        </button>

        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center justify-center p-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
        >
          <PackageCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-medium mt-0.5">Track</span>
        </button>
      </div>
    </div>
  );
};
