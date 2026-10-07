import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Shirt, 
  UtensilsCrossed, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import { AffiliatePlatform, ProductCategory } from '../types';
import { Language, translations } from '../translations';

interface CategoryBarProps {
  lang: Language;
  selectedPlatform: AffiliatePlatform | 'all';
  onSelectPlatform: (platform: AffiliatePlatform | 'all') => void;
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (category: ProductCategory | 'all') => void;
  sortBy: 'discount' | 'price_low' | 'price_high' | 'rating' | 'popular';
  onSortChange: (sort: 'discount' | 'price_low' | 'price_high' | 'rating' | 'popular') => void;
  totalProductsCount: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  lang,
  selectedPlatform,
  onSelectPlatform,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalProductsCount,
}) => {
  const t = translations[lang];

  const platforms: { id: AffiliatePlatform | 'all'; label: string }[] = [
    { id: 'all', label: t.allPlatforms },
    { id: 'amazon', label: 'Amazon Deals' },
    { id: 'flipkart', label: 'Flipkart Offers' },
    { id: 'meesho', label: 'Meesho Budget' },
  ];

  const categories: { id: ProductCategory | 'all'; labelBn: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'all', labelBn: 'সকল প্রোডাক্ট', labelEn: 'All Items', icon: <Flame className="w-4 h-4" /> },
    { id: 'electronics', labelBn: 'ইলেকট্রনিক্স', labelEn: 'Electronics', icon: <Laptop className="w-4 h-4" /> },
    { id: 'gadgets', labelBn: 'স্মার্ট গ্যাজেট', labelEn: 'Gadgets', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'fashion', labelBn: 'ফ্যাশন', labelEn: 'Fashion', icon: <Shirt className="w-4 h-4" /> },
    { id: 'home_kitchen', labelBn: 'হোম ও কিচেন', labelEn: 'Home & Kitchen', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'beauty_personal', labelBn: 'সৌন্দর্য', labelEn: 'Beauty Care', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 space-y-4">
      {/* Platform Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto max-w-full">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedPlatform === p.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Sort & Counter */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline tabular-nums">
            {totalProductsCount} {lang === 'bn' ? 'টি অফার উপলভ্য' : 'deals found'}
          </span>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="discount" className="dark:bg-slate-800">Highest Discount %</option>
              <option value="popular" className="dark:bg-slate-800">Most Popular / Clicks</option>
              <option value="price_low" className="dark:bg-slate-800">Price: Low to High</option>
              <option value="price_high" className="dark:bg-slate-800">Price: High to Low</option>
              <option value="rating" className="dark:bg-slate-800">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className={isSelected ? 'text-amber-400 dark:text-amber-600' : 'text-slate-400'}>
                {cat.icon}
              </span>
              <span>{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
