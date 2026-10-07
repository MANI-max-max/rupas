import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Search, 
  PackageCheck,
  Globe
} from 'lucide-react';
import { Language, translations } from '../translations';
import { AffiliatePlatform } from '../types';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
  selectedPlatform: AffiliatePlatform | 'all';
  onSelectPlatform: (platform: AffiliatePlatform | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenTracking,
  selectedPlatform,
  onSelectPlatform,
  searchQuery,
  onSearchChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const t = translations[lang];

  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    onSelectPlatform('all');
    onSearchChange('');
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 3) {
      setLogoClicks(0);
      onOpenAdmin();
    }
    setTimeout(() => setLogoClicks(0), 2500);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* ZONE 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleLogoClick}
              className="text-left group cursor-pointer focus:outline-none"
              aria-label="Rupas.Shop Home"
              title="Rupas.Shop"
            >
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                <span className="text-amber-500">Rupas</span>.Shop
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse ml-0.5"></span>
              </span>
            </button>
          </div>

          {/* Search bar in middle on desktop / tablet */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ZONE 2: Clean 4-5 Text Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => { onSelectPlatform('all'); }}
              className={`hover:text-amber-500 transition-colors cursor-pointer ${
                selectedPlatform === 'all' ? 'text-amber-500 font-semibold border-b-2 border-amber-500 pb-0.5' : ''
              }`}
            >
              {t.allDeals}
            </button>
            <button
              onClick={() => { onSelectPlatform('amazon'); }}
              className={`hover:text-amber-500 transition-colors cursor-pointer ${
                selectedPlatform === 'amazon' ? 'text-amber-500 font-semibold border-b-2 border-amber-500 pb-0.5' : ''
              }`}
            >
              Amazon
            </button>
            <button
              onClick={() => { onSelectPlatform('flipkart'); }}
              className={`hover:text-amber-500 transition-colors cursor-pointer ${
                selectedPlatform === 'flipkart' ? 'text-amber-500 font-semibold border-b-2 border-amber-500 pb-0.5' : ''
              }`}
            >
              Flipkart
            </button>
            <button
              onClick={() => { onSelectPlatform('meesho'); }}
              className={`hover:text-amber-500 transition-colors cursor-pointer ${
                selectedPlatform === 'meesho' ? 'text-amber-500 font-semibold border-b-2 border-amber-500 pb-0.5' : ''
              }`}
            >
              Meesho
            </button>
            <button
              onClick={onOpenTracking}
              className="hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-emerald-500" />
              <span>{t.trackOrder}</span>
            </button>
          </nav>

          {/* ZONE 3: Primary Actions (Language, Theme, Cart, Admin) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'বাংলা' : 'ENG'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Shopping Cart button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              aria-label="Open mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile search input when below md */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
