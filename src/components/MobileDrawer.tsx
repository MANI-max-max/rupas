import React from 'react';
import { 
  X, 
  Home, 
  Layers, 
  Tag, 
  PackageCheck, 
  ShieldCheck, 
  Video, 
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Language, translations } from '../translations';
import { AffiliatePlatform, ProductCategory } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  selectedPlatform: AffiliatePlatform | 'all';
  onSelectPlatform: (platform: AffiliatePlatform | 'all') => void;
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  onOpenTracking: () => void;
  onOpenAdmin?: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  selectedPlatform,
  onSelectPlatform,
  selectedCategory,
  onSelectCategory,
  onOpenTracking,
  onOpenAdmin,
  onOpenCart,
  cartCount,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const categories: { id: ProductCategory; labelBn: string; labelEn: string }[] = [
    { id: 'electronics', labelBn: 'ইলেকট্রনিক্স', labelEn: 'Electronics' },
    { id: 'gadgets', labelBn: 'স্মার্ট গ্যাজেট', labelEn: 'Smart Gadgets' },
    { id: 'fashion', labelBn: 'ফ্যাশন ও ক্লদিং', labelEn: 'Fashion & Style' },
    { id: 'home_kitchen', labelBn: 'হোম ও কিচেন', labelEn: 'Home & Kitchen' },
    { id: 'beauty_personal', labelBn: 'সৌন্দর্য ও রূপচর্চা', labelEn: 'Beauty & Personal Care' },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-1">
            <span className="text-amber-500">Rupas</span>.Shop
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-4 space-y-6 flex-1">
          {/* Main quick links */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Navigation
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onSelectPlatform('all'); onSelectCategory('all'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPlatform === 'all' && selectedCategory === 'all'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' 
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{t.allDeals}</span>
              </button>

              <button
                onClick={() => { onOpenCart(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>{t.cart}</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-amber-500 text-white font-bold text-xs px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { onOpenTracking(); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <PackageCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.trackOrder}</span>
              </button>
            </div>
          </div>

          {/* Platforms Filter */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Affiliate Platforms
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['all', 'amazon', 'flipkart', 'meesho'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { onSelectPlatform(p); onClose(); }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedPlatform === p 
                      ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p === 'all' ? 'All Platforms' : p === 'amazon' ? 'Amazon' : p === 'flipkart' ? 'Flipkart' : 'Meesho'}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {t.topCategories}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onSelectCategory('all'); onClose(); }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium ${
                  selectedCategory === 'all' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { onSelectCategory(cat.id); onClose(); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-amber-500 text-white' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang === 'bn' ? cat.labelBn : cat.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
